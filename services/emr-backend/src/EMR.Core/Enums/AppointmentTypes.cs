namespace EMR.Core.Enums;

public enum AppointmentStatus
{
    Scheduled = 1,
    Confirmed = 2,
    CheckedIn = 3,
    InProgress = 4,
    Completed = 5,
    Cancelled = 6,
    NoShow = 7,
    Rescheduled = 8
}

public enum AppointmentType
{
    NewPatient = 1,
    FollowUp = 2,
    Annual = 3,
    Physical = 4,
    Consultation = 5,
    Procedure = 6,
    Emergency = 7,
    Telemedicine = 8,
    PhysicalTherapy = 9,
    OccupationalTherapy = 10
}

public enum Priority
{
    Low = 1,
    Normal = 2,
    High = 3,
    Urgent = 4,
    Emergency = 5
}