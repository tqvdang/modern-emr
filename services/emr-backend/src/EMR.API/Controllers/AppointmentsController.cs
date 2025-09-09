using Microsoft.AspNetCore.Mvc;

namespace EMR.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AppointmentsController : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAppointments([FromQuery] string? date = null)
    {
        // Mock appointment data
        var appointments = new[]
        {
            new
            {
                id = 1,
                uuid = "uuid-1",
                patientId = 1,
                providerId = 1,
                startDateTime = "2025-09-07T09:00:00Z",
                endDateTime = "2025-09-07T10:00:00Z",
                status = "Completed",
                appointmentType = "Physical Therapy Evaluation",
                priority = "Normal",
                title = "John Smith - PT Evaluation",
                patient = new
                {
                    id = 1,
                    uuid = "patient-1",
                    firstName = "John",
                    lastName = "Smith",
                    gender = "Male",
                    status = "Active",
                    createdAt = "2025-01-01T00:00:00Z"
                }
            },
            new
            {
                id = 2,
                uuid = "uuid-2",
                patientId = 2,
                providerId = 1,
                startDateTime = "2025-09-07T10:30:00Z",
                endDateTime = "2025-09-07T11:30:00Z",
                status = "In Progress",
                appointmentType = "Follow-up Session",
                priority = "Normal",
                title = "Maria Garcia - Follow-up",
                patient = new
                {
                    id = 2,
                    uuid = "patient-2",
                    firstName = "Maria",
                    lastName = "Garcia",
                    gender = "Female",
                    status = "Active",
                    createdAt = "2025-01-01T00:00:00Z"
                }
            },
            new
            {
                id = 3,
                uuid = "uuid-3",
                patientId = 3,
                providerId = 1,
                startDateTime = "2025-09-07T14:00:00Z",
                endDateTime = "2025-09-07T15:00:00Z",
                status = "Upcoming",
                appointmentType = "Initial Consultation",
                priority = "Normal",
                title = "Robert Johnson - Initial",
                patient = new
                {
                    id = 3,
                    uuid = "patient-3",
                    firstName = "Robert",
                    lastName = "Johnson",
                    gender = "Male",
                    status = "Active",
                    createdAt = "2025-01-01T00:00:00Z"
                }
            },
            new
            {
                id = 4,
                uuid = "uuid-4",
                patientId = 4,
                providerId = 1,
                startDateTime = "2025-09-07T15:30:00Z",
                endDateTime = "2025-09-07T16:30:00Z",
                status = "Urgent",
                appointmentType = "Walk-in Assessment",
                priority = "High",
                title = "Emergency Patient",
                patient = new
                {
                    id = 4,
                    uuid = "patient-4",
                    firstName = "Emergency",
                    lastName = "Patient",
                    gender = "Unknown",
                    status = "Active",
                    createdAt = "2025-01-01T00:00:00Z"
                }
            }
        };

        // Filter by date if provided
        if (!string.IsNullOrEmpty(date))
        {
            var targetDate = DateTime.Parse(date).Date;
            appointments = appointments.Where(a => 
                DateTime.Parse(a.startDateTime).Date == targetDate).ToArray();
        }

        return Ok(appointments);
    }

    [HttpPost]
    public async Task<IActionResult> CreateAppointment([FromBody] object appointmentData)
    {
        // Mock response - in real implementation would create actual appointment
        var newAppointment = new
        {
            id = 5,
            uuid = "uuid-5",
            patientId = 1,
            providerId = 1,
            startDateTime = DateTime.UtcNow.AddDays(1).ToString("O"),
            endDateTime = DateTime.UtcNow.AddDays(1).AddHours(1).ToString("O"),
            status = "Confirmed",
            appointmentType = "Physical Therapy Session",
            priority = "Normal",
            title = "New Appointment",
            patient = new
            {
                id = 1,
                uuid = "patient-1",
                firstName = "John",
                lastName = "Smith",
                gender = "Male",
                status = "Active",
                createdAt = "2025-01-01T00:00:00Z"
            }
        };

        return CreatedAtAction(nameof(GetAppointments), new { id = newAppointment.id }, newAppointment);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateAppointmentStatus(int id, [FromBody] object statusData)
    {
        // Mock response - in real implementation would update actual appointment
        var updatedAppointment = new
        {
            id,
            uuid = $"uuid-{id}",
            patientId = 1,
            providerId = 1,
            startDateTime = "2025-09-07T14:00:00Z",
            endDateTime = "2025-09-07T15:00:00Z",
            status = "Updated",
            appointmentType = "Physical Therapy Session",
            priority = "Normal",
            title = "Updated Appointment",
            patient = new
            {
                id = 1,
                uuid = "patient-1",
                firstName = "John",
                lastName = "Smith",
                gender = "Male",
                status = "Active",
                createdAt = "2025-01-01T00:00:00Z"
            }
        };

        return Ok(updatedAppointment);
    }
}