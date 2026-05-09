using Microsoft.EntityFrameworkCore;
using RendaControl.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Configuração do Banco PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
options.UseNpgsql(
builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Configuração do CORS (Política Nomeada)
builder.Services.AddCors(options =>
{
options.AddPolicy("OpenPolicy", policy =>
{
policy.AllowAnyOrigin() // Permite qualquer site acessar a API
.AllowAnyMethod() // Permite GET, POST, PUT, DELETE
.AllowAnyHeader(); // Permite qualquer cabeçalho
});
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var app = builder.Build();

// 3. Execução das Migrations automaticamente no Deploy
using (var scope = app.Services.CreateScope())
{
var services = scope.ServiceProvider;
try
{
var context = services.GetRequiredService<AppDbContext>();
context.Database.Migrate();
Console.WriteLine("Banco de dados sincronizado com sucesso!");
}
catch (Exception ex)
{
Console.WriteLine($"Erro ao sincronizar banco: {ex.Message}");
}
}

// 4. Middlewares
app.UseSwagger();
app.UseSwaggerUI();

// O UseCors deve vir exatamente aqui: após o Swagger e antes da Autorização
app.UseCors("OpenPolicy");

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

// 5. Configuração de Porta para o Railway
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Run($"http://0.0.0.0:{port}");