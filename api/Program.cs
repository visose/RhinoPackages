using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using RhinoPackages.Api;

var host = new HostBuilder()
    .ConfigureFunctionsWebApplication()
    .ConfigureServices(config =>
    {
        config.AddSingleton<Store>();
    })
    .Build();

await host.RunAsync();
