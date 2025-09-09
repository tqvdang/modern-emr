using Microsoft.AspNetCore.Mvc;
using MediatR;
using EMR.Application.Commands.CreatePatient;
using EMR.Application.DTOs;
using EMR.Application.Common;
using EMR.Application.Queries.GetPatients;

namespace EMR.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class PatientsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<PatientsController> _logger;

    public PatientsController(IMediator mediator, ILogger<PatientsController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    [HttpPost]
    public async Task<ActionResult<PatientDto>> CreatePatient([FromBody] CreatePatientCommand command)
    {
        var result = await _mediator.Send(command);

        return result.StatusCode switch
        {
            200 => Ok(result.Data),
            201 => CreatedAtAction(nameof(GetPatient), new { id = result.Data!.Id }, result.Data),
            400 => BadRequest(new { message = result.ErrorMessage, errors = result.ValidationErrors }),
            404 => NotFound(new { message = result.ErrorMessage }),
            409 => Conflict(new { message = result.ErrorMessage }),
            _ => StatusCode(result.StatusCode, new { message = result.ErrorMessage })
        };
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PatientDto>> GetPatient(long id)
    {
        // This will be implemented when we create the GetPatientById query
        return NotFound("GetPatient implementation pending");
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PatientDto>>> GetPatients([FromQuery] PatientSearchDto searchDto)
    {
        var query = new GetPatientsQuery
        {
            SearchTerm = searchDto.SearchTerm,
            Gender = searchDto.Gender,
            DateOfBirthFrom = searchDto.DateOfBirthFrom,
            DateOfBirthTo = searchDto.DateOfBirthTo,
            ProviderId = searchDto.ProviderId,
            Status = searchDto.Status,
            Page = searchDto.Page,
            PageSize = searchDto.PageSize,
            SortBy = searchDto.SortBy,
            SortDescending = searchDto.SortDescending
        };

        var result = await _mediator.Send(query);

        return result.StatusCode switch
        {
            200 => Ok(result.Data),
            400 => BadRequest(new { message = result.ErrorMessage, errors = result.ValidationErrors }),
            404 => NotFound(new { message = result.ErrorMessage }),
            _ => StatusCode(result.StatusCode, new { message = result.ErrorMessage })
        };
    }
}