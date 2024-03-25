using backend;
using backend.Hubs;
using backend.Services;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<TestContext>();
builder.Services.AddSignalR();

// Add services to the container.
var  MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
//builder.Services.AddCors(options =>
//{
//    options.AddPolicy(name: MyAllowSpecificOrigins,
//                      policy  =>
//                      {
//                          policy.WithOrigins("http://localhost:3000");
//                      });
//});

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddMemoryCache();
builder.Services.AddSingleton<IAIService, OpenAIService>();
// ADD DBContext

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors(x => x
        .AllowAnyMethod()
        .AllowAnyHeader()
        .SetIsOriginAllowed(origin => true) // allow any origin
        .AllowCredentials()); // allow credentials
}

app.UseHttpsRedirection();

app.UseAuthorization();
//app.UseCors(MyAllowSpecificOrigins);


app.MapControllers();
app.MapHub<DataHub>("/hub");

app.Run();
