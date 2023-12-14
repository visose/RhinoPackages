using System.Text.Json;
using Microsoft.Extensions.Logging;
using Azure.Storage.Blobs;

namespace RhinoPackages.Api;

record Package(string Id, string Version, DateTime Updated, string Authors, int Downloads, string? IconUrl,
    string Description, string Keywords, bool Prerelease, string? HomepageUrl, Filters Filters, List<Owner> Owners);

record Owner(int Id, string Name);

[Flags]
enum Filters
{
    None = 0,
    Windows = 1,
    Mac = 2,
    Rhino = 4,
    Grasshopper = 8,
    Rhino6 = 16,
    Rhino7 = 32,
    Rhino8 = 64
}

class Store(ILogger<EndPoints> logger)
{
    const string _dataFile = "data.json";

    readonly static JsonSerializerOptions _options = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public async Task SavePackages(bool clear)
    {
        List<Package> packages = [];

        if (!clear)
        {
            packages.AddRange(await LoadPackages());
        }

        Seeder seeder = new(logger, packages);
        var updates = await seeder.Run();

        logger.LogInformation("{Count} packages to update...", updates.Count);

        if (!clear && updates.Count == 0)
            return;

        foreach (var (action, package) in updates)
        {
            switch (action)
            {
                case Update.New:
                    packages.Add(package);
                    break;
                case Update.Update:
                    var index = packages.FindIndex(p => p.Id == package.Id);
                    packages[index] = package;
                    break;
            }
        }

        logger.LogInformation("Saving packages...");

        var blob = GetBlob();
        using var stream = await blob.OpenWriteAsync(true);
        await JsonSerializer.SerializeAsync(stream, packages, _options);
    }

    static BlobClient GetBlob()
    {
        string connectionString = Environment.GetEnvironmentVariable("AzureWebJobsStorage")
            ?? throw new("Connection string not found.");

        BlobServiceClient client = new(connectionString);

        var container = client.GetBlobContainerClient("packages");
        return container.GetBlobClient(_dataFile);
    }

    static async Task<Package[]> LoadPackages()
    {
        var blob = GetBlob();

        if (!(await blob.ExistsAsync()))
            return [];

        var data = await blob.DownloadStreamingAsync();
        using var stream = data.Value.Content;

        return await JsonSerializer.DeserializeAsync<Package[]>(stream, _options)
            ?? throw new("Could not deserialize packages.");
    }
}
