To run the program install requirements.

# Provide API Keys

OpenAI backend needs to be added to appsetting in the backend like so

```cs
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "OPEN_AI_KEY": "[YOUR API KEY]"
}
```

To gather data from Google Maps Route API, create a `config.py` in root and add a variable like so:
```py
GoogleAPIKey = "[YOUR API KEY]"
```
Afterwards set debugging to `FALSE` in `datafetcher.py`

Lastly change the route in the DB context to where you have stored your DB file

```cs
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlite("Data Source=[YOUR PATH]");
```
