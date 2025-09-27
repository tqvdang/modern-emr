import { useState, useEffect } from 'react';
import { useAppointments } from '@/hooks/useAppointments';
import { CreateAppointmentRequest, Provider, AvailableTimeSlot } from '@/lib/api';

interface AppointmentSchedulerProps {
  onClose: () => void;
  selectedPatientId?: number;
  onAppointmentCreated?: (appointment: any) => void;
}

export default function AppointmentScheduler({ 
  onClose, 
  selectedPatientId, 
  onAppointmentCreated 
}: AppointmentSchedulerProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<CreateAppointmentRequest>>({
    patientId: selectedPatientId,
    appointmentType: '',
    description: '',
  });
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailableTimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableTimeSlot | null>(null);
  
  const { 
    createAppointment, 
    bookingLoading, 
    providers, 
    fetchProviders,
    fetchAvailableSlots 
  } = useAppointments();

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  useEffect(() => {
    if (selectedDate && selectedProvider && formData.appointmentType) {
      fetchAvailableSlots(selectedProvider.id, selectedDate, formData.appointmentType);
    }
  }, [selectedDate, selectedProvider, formData.appointmentType, fetchAvailableSlots]);

  const appointmentTypes = [
    'Initial Evaluation',
    'Physical Therapy Session',
    'Follow-up Session',
    'Consultation',
    'Re-evaluation',
    'Discharge Planning',
    'Home Exercise Review'
  ];

  const priorities = [
    { value: 'Low', label: 'Low', color: 'text-green-600' },
    { value: 'Normal', label: 'Normal', color: 'text-blue-600' },
    { value: 'High', label: 'High', color: 'text-orange-600' },
    { value: 'Urgent', label: 'Urgent', color: 'text-red-600' },
  ];

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleProviderSelect = (provider: Provider) => {
    setSelectedProvider(provider);
    setFormData(prev => ({ ...prev, providerId: provider.id }));
    setAvailableSlots([]);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: AvailableTimeSlot) => {
    setSelectedSlot(slot);
    setFormData(prev => ({
      ...prev,
      startDateTime: slot.startDateTime,
      endDateTime: slot.endDateTime,
      providerId: slot.providerId,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.patientId || !formData.providerId || !formData.startDateTime || !formData.endDateTime) {
      alert('Please complete all required fields');
      return;
    }

    const appointmentData: CreateAppointmentRequest = {
      patientId: formData.patientId,
      providerId: formData.providerId,
      startDateTime: formData.startDateTime,
      endDateTime: formData.endDateTime,
      appointmentType: formData.appointmentType || 'Physical Therapy Session',
      priority: formData.priority || 'Normal',
      description: formData.description,
    };

    const result = await createAppointment(appointmentData);
    if (result) {
      onAppointmentCreated?.(result);
      onClose();
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      day: date.toLocaleDateString('en-US', { weekday: 'long' })
    };
  };

  // Generate available dates (next 30 days, excluding weekends)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends (assuming clinic is closed)
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          }),
          fullLabel: date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric',
            month: 'long', 
            day: 'numeric' 
          })
        });
      }
    }
    
    return dates;
  };

  const availableDates = getAvailableDates();

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-6 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Schedule Appointment</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  step >= stepNumber 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-24 h-1 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>Appointment Details</span>
            <span>Select Provider</span>
            <span>Choose Time</span>
            <span>Confirm</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-96">
          
          {/* Step 1: Appointment Details */}
          {step === 1 && (
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-gray-900">Appointment Details</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Type *
                  </label>
                  <select
                    value={formData.appointmentType || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, appointmentType: e.target.value }))}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select appointment type</option>
                    {appointmentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority || 'Normal'}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description / Chief Complaint
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Describe the reason for this appointment..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date *
                </label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a date</option>
                  {availableDates.map(date => (
                    <option key={date.value} value={date.value}>
                      {date.fullLabel}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Select Provider */}
          {step === 2 && (
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-gray-900">Select Provider</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {providers.map((provider) => (
                  <div
                    key={provider.id}
                    onClick={() => handleProviderSelect(provider)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedProvider?.id === provider.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-medium text-gray-900">
                          {provider.firstName} {provider.lastName}
                        </h5>
                        <p className="text-sm text-gray-600">{provider.specialization}</p>
                        {provider.credentials && (
                          <p className="text-xs text-gray-500 mt-1">
                            {provider.credentials.join(', ')}
                          </p>
                        )}
                      </div>
                      {provider.rating && (
                        <div className="text-right">
                          <div className="flex items-center text-sm">
                            <span className="text-yellow-400">★</span>
                            <span className="ml-1 text-gray-600">{provider.rating}</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            ({provider.reviewCount} reviews)
                          </p>
                        </div>
                      )}
                    </div>
                    {provider.bio && (
                      <p className="text-sm text-gray-600 mt-2">{provider.bio}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Choose Time Slot */}
          {step === 3 && (
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-gray-900">
                Available Times for {selectedDate && availableDates.find(d => d.value === selectedDate)?.fullLabel}
              </h4>
              
              {availableSlots.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {availableSlots.map((slot, index) => {
                    const { time } = formatDateTime(slot.startDateTime);
                    return (
                      <button
                        key={index}
                        onClick={() => handleSlotSelect(slot)}
                        className={`p-3 text-center rounded-lg border transition-colors ${
                          selectedSlot?.startDateTime === slot.startDateTime
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400 text-gray-700'
                        }`}
                      >
                        <div className="font-medium">{time}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {slot.appointmentType}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>No available time slots for the selected date and appointment type.</p>
                  <p className="text-sm mt-2">Please try a different date or appointment type.</p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-gray-900">Confirm Appointment</h4>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Appointment Details</h5>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <span className="ml-2 font-medium">{formData.appointmentType}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Priority:</span>
                        <span className={`ml-2 font-medium ${
                          priorities.find(p => p.value === formData.priority)?.color || 'text-gray-900'
                        }`}>
                          {formData.priority}
                        </span>
                      </div>
                      {formData.description && (
                        <div>
                          <span className="text-gray-600">Description:</span>
                          <p className="mt-1 text-gray-900">{formData.description}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Schedule & Provider</h5>
                    <div className="space-y-2 text-sm">
                      {selectedSlot && (
                        <>
                          <div>
                            <span className="text-gray-600">Date:</span>
                            <span className="ml-2 font-medium">
                              {formatDateTime(selectedSlot.startDateTime).date}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Time:</span>
                            <span className="ml-2 font-medium">
                              {formatDateTime(selectedSlot.startDateTime).time} - 
                              {formatDateTime(selectedSlot.endDateTime).time}
                            </span>
                          </div>
                        </>
                      )}
                      {selectedProvider && (
                        <div>
                          <span className="text-gray-600">Provider:</span>
                          <span className="ml-2 font-medium">
                            {selectedProvider.firstName} {selectedProvider.lastName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <button
            onClick={step === 1 ? onClose : handleBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          
          <button
            onClick={step === 4 ? handleSubmit : handleNext}
            disabled={(step === 1 && (!formData.appointmentType || !selectedDate)) ||
                     (step === 2 && !selectedProvider) ||
                     (step === 3 && !selectedSlot) ||
                     bookingLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {bookingLoading ? 'Scheduling...' : (step === 4 ? 'Schedule Appointment' : 'Next')}
          </button>
        </div>
      </div>
    </div>
  );
}