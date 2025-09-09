namespace EMR.Core.Enums;

public enum Gender
{
    Male = 1,
    Female = 2,
    Other = 3,
    PreferNotToSay = 4
}

public enum MaritalStatus
{
    Single = 1,
    Married = 2,
    Divorced = 3,
    Widowed = 4,
    Separated = 5,
    DomesticPartnership = 6,
    Other = 7
}

public enum PatientStatus
{
    Active = 1,
    Inactive = 2,
    Deceased = 3,
    Transferred = 4
}

public enum EncounterStatus
{
    Scheduled = 1,
    InProgress = 2,
    Completed = 3,
    Cancelled = 4
}

public enum AllergyType
{
    Drug = 1,
    Food = 2,
    Environmental = 3,
    Other = 4
}

public enum SeverityLevel
{
    Mild = 1,
    Moderate = 2,
    Severe = 3,
    LifeThreatening = 4
}

public enum VitalSignType
{
    BloodPressure = 1,
    HeartRate = 2,
    Temperature = 3,
    RespiratoryRate = 4,
    Weight = 5,
    Height = 6,
    BMI = 7,
    OxygenSaturation = 8,
    BloodGlucose = 9
}