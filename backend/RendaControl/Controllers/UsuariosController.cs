using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RendaControl.Data;
using RendaControl.Models;

namespace RendaControl.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuariosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsuariosController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("cadastrar")]
        public async Task<IActionResult> Cadastrar([FromBody] Usuario? usuario)
        {
            if (usuario == null)
                return BadRequest(new { mensagem = "Dados inválidos." });

            if (string.IsNullOrWhiteSpace(usuario.Nome) ||
                string.IsNullOrWhiteSpace(usuario.Email) ||
                string.IsNullOrWhiteSpace(usuario.Senha))
            {
                return BadRequest(new { mensagem = "Preencha todos os campos." });
            }

            bool emailJaExiste = await _context.Usuarios
                .AnyAsync(u => u.Email == usuario.Email);

            if (emailJaExiste)
                return BadRequest(new { mensagem = "Este e-mail já está cadastrado." });

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                id = usuario.Id,
                nome = usuario.Nome,
                email = usuario.Email
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest? request)
        {
            if (request == null)
                return BadRequest(new { mensagem = "Dados inválidos." });

            Usuario? usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u =>
                    u.Email == request.Email &&
                    u.Senha == request.Senha);

            if (usuario == null)
                return Unauthorized(new { mensagem = "E-mail ou senha incorretos." });

            return Ok(new
            {
                id = usuario.Id,
                nome = usuario.Nome,
                email = usuario.Email
            });
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = "";
        public string Senha { get; set; } = "";
    }
}