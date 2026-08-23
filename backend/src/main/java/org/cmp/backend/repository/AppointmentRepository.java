package org.cmp.backend.repository;

import org.cmp.backend.entity.Appointment;
import org.cmp.backend.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.OffsetDateTime;
import java.util.UUID;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID>, JpaSpecificationExecutor<Appointment> {

    boolean existsByDoctorIdAndAppointmentDateTimeAndStatusNot(
            UUID doctorId, OffsetDateTime appointmentDateTime, AppointmentStatus status);

    boolean existsByDoctorIdAndAppointmentDateTimeAndStatusNotAndIdNot(
            UUID doctorId, OffsetDateTime appointmentDateTime, AppointmentStatus status, UUID id);
}