using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RendaControl.Data;
using RendaControl.Models;

namespace RendaControl.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServicosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ServicosController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/servicos
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var servicos = await _context.Servicos
                .Include(s => s.Cliente)
                .ToListAsync();
            return Ok(servicos);
        }

        // GET: api/servicos/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var servico = await _context.Servicos
                .Include(s => s.Cliente)
                .FirstOrDefaultAsync(s => s.Id == id);
            if (servico == null) return NotFound();
            return Ok(servico);
        }

        // GET: api/servicos/cliente/1
        [HttpGet("cliente/{clienteId}")]
        public async Task<IActionResult> GetByCliente(int clienteId)
        {
            var servicos = await _context.Servicos
                .Include(s => s.Cliente)
                .Where(s => s.ClienteId == clienteId)
                .ToListAsync();
            return Ok(servicos);
        }

        // POST: api/servicos
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Servico servico)
        {
            if (servico.DataRealizacao.HasValue)
                servico.DataRealizacao = DateTime.SpecifyKind(
                    servico.DataRealizacao.Value, DateTimeKind.Utc);

            _context.Servicos.Add(servico);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = servico.Id }, servico);
        }

        // PUT: api/servicos/1
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Servico servico)
        {
            if (id != servico.Id) return BadRequest();

            if (servico.DataRealizacao.HasValue)
                servico.DataRealizacao = DateTime.SpecifyKind(
                    servico.DataRealizacao.Value, DateTimeKind.Utc);

            _context.Entry(servico).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/servicos/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var servico = await _context.Servicos.FindAsync(id);
            if (servico == null) return NotFound();
            _context.Servicos.Remove(servico);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}