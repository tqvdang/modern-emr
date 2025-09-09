using AutoMapper;
using EMR.Application.Commands.Authentication;
using EMR.Application.DTOs;
using EMR.Core.Entities;

namespace EMR.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<User, EMR.Application.DTOs.UserDto>()
            .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.Email))
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role ?? ""))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status))
            .ForMember(dest => dest.Specialization, opt => opt.MapFrom(src => src.Specialty))
            .ForMember(dest => dest.Credentials, opt => opt.MapFrom(src => src.Title))
            .ForMember(dest => dest.Bio, opt => opt.Ignore())
            .ForMember(dest => dest.FacilityId, opt => opt.Ignore())
            .ForMember(dest => dest.LastLogin, opt => opt.Ignore());

        CreateMap<User, EMR.Application.Commands.Authentication.UserDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.Uuid, opt => opt.MapFrom(src => src.Uuid))
            .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.FirstName))
            .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.LastName))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
            .ForMember(dest => dest.UserType, opt => opt.MapFrom(src => src.UserType))
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role))
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.FullName));

        CreateMap<Patient, PatientDto>()
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.FullName))
            .ForMember(dest => dest.DisplayName, opt => opt.MapFrom(src => src.DisplayName))
            .ForMember(dest => dest.Age, opt => opt.MapFrom(src => src.Age))
            .ForMember(dest => dest.PrimaryProvider, opt => opt.MapFrom(src => src.PrimaryProvider));

        CreateMap<Appointment, AppointmentDto>()
            .ForMember(dest => dest.Patient, opt => opt.MapFrom(src => src.Patient))
            .ForMember(dest => dest.Provider, opt => opt.MapFrom(src => src.Provider));

        CreateMap<Encounter, EncounterDto>()
            .ForMember(dest => dest.Patient, opt => opt.MapFrom(src => src.Patient))
            .ForMember(dest => dest.Provider, opt => opt.MapFrom(src => src.Provider));

        // PatientAllergy mapping removed until PatientAllergyDto is defined and entity properties are confirmed
    }
}