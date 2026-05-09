using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RendaControl.Models
{
    [Table("Servicos")]
    public class Servico
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Informe a descrição")]
        public string Descricao { get; set; } = string.Empty;

        [Required(ErrorMessage = "Informe o valor")]
        public decimal Valor { get; set; }

        public DateTime? DataRealizacao { get; set; }

        public string? FormaPagamento { get; set; }

        public string? Status { get; set; } // Pago, Pendente, Atrasado

        public string? MateriaisUtilizados { get; set; }

        // Chave estrangeira para Cliente
        [Required(ErrorMessage = "Informe o cliente")]
        public int ClienteId { get; set; }

        [ForeignKey("ClienteId")]
        public Cliente? Cliente { get; set; }
    }
}