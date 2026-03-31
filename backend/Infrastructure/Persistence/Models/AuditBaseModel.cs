using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TourGuideBackend.Infrastructure.Persistence.Models
{
    // Base audit class for history/audit records
    public class AuditBaseModel
    {
        // Note: Python version used integer autoincrement for general audit base,
        // some derived classes override id type. Here we provide common audit fields.
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        public string TableName {get; set;} = default!;
        public string Action { get; set; } = default!; // UPDATE | DELETE
        public string RecordId { get; set; } = string.Empty ;
        public DateTime ChangedAt { get; set; }
        // store JSON blobs as object; mapping code/ORM should serialize/deserialize
        [Column(TypeName = "jsonb")]
        public object? OldVal { get; set; }
        [Column(TypeName = "jsonb")]
        public object? NewVal { get; set; }
    }
}
