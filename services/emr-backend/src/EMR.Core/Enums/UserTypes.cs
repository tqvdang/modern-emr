namespace EMR.Core.Enums;

public enum UserType
{
    Admin = 1,
    Staff = 2,
    Provider = 3,
    Patient = 4
}

public enum UserRole
{
    Administrator = 1,
    Physician = 2,
    Nurse = 3,
    PhysicianAssistant = 4,
    NursePractitioner = 5,
    PhysicalTherapist = 6,
    OccupationalTherapist = 7,
    Pharmacist = 8,
    MedicalAssistant = 9,
    OfficeManager = 10,
    Receptionist = 11,
    Other = 12
}

public enum UserStatus
{
    Active = 1,
    Inactive = 2,
    Suspended = 3,
    PendingActivation = 4
}