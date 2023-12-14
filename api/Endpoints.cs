using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.Functions.Worker;

namespace RhinoPackages.Api;

class EndPoints(Store store)
{
    [Function("seed-cron")]
    [FixedDelayRetry(5, "00:00:10")]
    public async Task SeedCronAsync(
        [TimerTrigger("0 0 1 * * *")] TimerInfo timerInfo
    )
    {
        await store.SavePackages(false);
    }

    [Function("seed")]
    public async Task<IActionResult> SeedAsync(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "seed")] HttpRequest req,
        bool clear = false
        )
    {
        var envToken = Environment.GetEnvironmentVariable("AUTH_TOKEN");
        var token = GetHeader(req, "Auth-Token");

        if (envToken is null || envToken != token)
            return new UnauthorizedResult();

        await store.SavePackages(clear);
        return new OkObjectResult("Packages updated.");
    }

    static string? GetHeader(HttpRequest req, string key)
    {
        if (!req.Headers.TryGetValue(key, out var value))
            return null;

        return value.FirstOrDefault();
    }
}
