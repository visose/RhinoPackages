using System.IO.Compression;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace RhinoPackages.Api;

record EntryYak(string Authors, int DownloadCount, string Name, string Version);
record PackageYak(string CreatedAt, string? Description, DistributionYak[] Distributions, string? HomepageUrl, string[]? Keywords, bool Prerelease);
record DistributionYak(string Filename, string Platform, string RhinoVersion, string Url);
record OwnerYak(int Id, string Name);

enum Update { None, New, Update }

class Seeder(ILogger logger, IEnumerable<Package> packages)
{
    readonly static JsonSerializerOptions _options = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
    };

    readonly HttpClient _client = new();

    public async Task<IList<(Update Update, Package Package)>> Run()
    {
        logger.LogInformation("Processing packages:");

        var entries = await Get<EntryYak[]>("packages");
        var packagesMap = packages.ToDictionary(package => package.Id);

        var updates = new (Update Update, Package Package)[entries.Length];

        ParallelOptions parallelOptions = new()
        {
            MaxDegreeOfParallelism = 16
        };

        await Parallel.ForEachAsync(
            entries.Select((e, i) => (Entry: e, Index: i)),
            parallelOptions,
            async (item, token) =>
        {
            var (entry, index) = item;

            if (packagesMap.TryGetValue(entry.Name, out var package))
            {
                if (package.Version == entry.Version)
                {
                    if (package.Downloads != entry.DownloadCount)
                    {
                        updates[index] = (Update.Update, package with { Downloads = entry.DownloadCount });
                    }
                }
                else
                {
                    updates[index] = (Update.Update, await MakePackage(entry));
                }
            }
            else
            {
                updates[index] = (Update.New, await MakePackage(entry));
            }

            logger.LogInformation("{Index} {Name}: {Update}", index, entry.Name, updates[index].Update);
        });

        return updates.Where(p => p.Update != Update.None).ToList();
    }

    async Task<T> Get<T>(string route)
    {
        var url = "https://yak.rhino3d.com/" + route;

        return await _client.GetFromJsonAsync<T>(url, _options)
            ?? throw new("Could not get package list.");
    }

    async Task<Package> MakePackage(EntryYak entry)
    {
        var packageTask = Get<PackageYak>($"versions/{entry.Name}/{entry.Version}");
        var ownersTask = Get<OwnerYak[]>($"packages/{entry.Name}/owners");

        await Task.WhenAll(packageTask, ownersTask);

        var package = packageTask.Result;
        var owners = ownersTask.Result;

        return new
        (
            Id: entry.Name,
            Version: entry.Version,
            Updated: DateTime.Parse(package.CreatedAt),
            Authors: entry.Authors,
            Downloads: entry.DownloadCount,
            IconUrl: await GetIcon(entry.Name, entry.Version),
            Description: package.Description ?? "",
            Keywords: package.Keywords is null ? "" : string.Join(", ", package.Keywords),
            Prerelease: package.Prerelease,
            HomepageUrl: package.HomepageUrl,
            Filters: await GetFilters(package.Distributions),
            Owners: owners.Select(o => new Owner(o.Id, o.Name)).ToList()
        );
    }

    async Task<Filters> GetFilters(DistributionYak[] distributions)
    {
        Filters filters = Filters.None;

        foreach (var distribution in distributions)
        {
            filters |= distribution.Platform switch
            {
                "win" => Filters.Windows,
                "mac" => Filters.Mac,
                _ => Filters.Windows | Filters.Mac
            };

            filters |= distribution.RhinoVersion[..3] switch
            {
                "rh6" => Filters.Rhino6,
                "rh7" => Filters.Rhino7,
                "rh8" => Filters.Rhino8,
                _ => Filters.Rhino6 | Filters.Rhino7 | Filters.Rhino8
            };

            filters |= await GetPluginType(distribution.Url);
        }

        return filters;
    }

    async Task<Filters> GetPluginType(string url)
    {
        using var stream = await _client.GetStreamAsync(url);
        using ZipArchive zip = new(stream, ZipArchiveMode.Read);

        Filters type = Filters.None;

        foreach (var entry in zip.Entries)
        {
            var ext = Path.GetExtension(entry.FullName);

            type |= ext switch
            {
                ".rhp" => Filters.Rhino,
                ".gha" => Filters.Grasshopper,
                _ => Filters.None
            };
        }

        return type;
    }

    async Task<string> GetIcon(string name, string version)
    {
        var url = $"https://yak.rhino3d.com/versions/{name}/{version}/_icon";

        try
        {
            var response = await _client.GetAsync(url);

            if (response.StatusCode != HttpStatusCode.OK)
                throw new("Not found");

            return url;
        }
        catch { }

        string[] specialIcons = ["plankton", "kangaroo", "metahopper", "iris", "imaging", "Weaver", "GhShaderNodes", "icosphere", "waterman", "Paneling"];
        var icon = specialIcons.FirstOrDefault(name.Contains) ?? "default";

        return $"/icons/special/{icon}.png";
    }
}
