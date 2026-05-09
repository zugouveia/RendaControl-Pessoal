using Microsoft.EntityFrameworkCore;
using RendaControl.Models;

namespace RendaControl.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        // Cada DbSet representa uma tabela no banco
        public DbSet<Cliente> Clientes { get; set; }
        public DbSet<Servico> Servicos { get; set; }
        public DbSet<Despesa> Despesas { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
    }
}