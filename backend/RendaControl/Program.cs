using Microsoft.EntityFrameworkCore;
using RendaControl.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Configuração do Banco PostgreSQL (Ajustada para o Railway)
// Tenta ler a variável do Railway primeiro; se não existir, usa a do appsettings (local)
var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection") 
                      ?? builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// 2. Configuração do CORS (Política Nomeada para evitar erros de acesso)
builder.Services.AddCors(options =>
{
    options.AddPolicy("OpenPolicy", policy =>
    {
        policy.AllowAnyOrigin() 
              .AllowAnyMethod() 
              .AllowAnyHeader(); 
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Necessário para lidar com datas no PostgreSQL
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var app = builder.Build();

// 3. Execução das Migrations automaticamente no Deploy
// Isso cria as tabelas no banco de dados do Railway assim que o app liga
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

// O UseCors deve vir exatamente aqui: antes da Redireção e Autorização
app.UseCors("OpenPolicy");

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

// 5. Configuração de Porta para o Railway
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Run($"http://0.0.0.0:{port}");