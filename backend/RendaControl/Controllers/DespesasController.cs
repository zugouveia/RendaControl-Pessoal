using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RendaControl.Data;
using RendaControl.Models;

namespace RendaControl.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DespesasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DespesasController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/despesas
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var despesas = await _context.Despesas.ToListAsync();
            return Ok(despesas);
        }

        // GET: api/despesas/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var despesa = await _context.Despesas.FindAsync(id);
            if (despesa == null) return NotFound();
            return Ok(despesa);
        }

        // POST: api/despesas
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Despesa despesa)
        {
            _context.Despesas.Add(despesa);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = despesa.Id }, despesa);
        }

        // PUT: api/despesas/1
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Despesa despesa)
        {
            if (id != despesa.Id) return BadRequest();
            _context.Entry(despesa).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/despesas/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var despesa = await _context.Despesas.FindAsync(id);
            if (despesa == null) return NotFound();
            _context.Despesas.Remove(despesa);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}