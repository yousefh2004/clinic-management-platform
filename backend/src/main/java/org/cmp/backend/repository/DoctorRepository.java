package org.cmp.backend.repository;

import org.cmp.backend.entity.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface DoctorRepository extends JpaRepository<Doctor, UUID> {

    boolean existsByEmail(String email);
    boolean existsByEmailAndIdNot(String email, UUID id);

    boolean existsByPhoneNumber(String phoneNumber);
    boolean existsByPhoneNumberAndIdNot(String phoneNumber, UUID id);

    boolean existsByDepartmentId(UUID departmentId);

    @Query("""
            SELECT d FROM Doctor d
            WHERE (:name IS NULL OR LOWER(CONCAT(d.firstName, ' ', d.lastName)) LIKE LOWER(CONCAT('%', :name, '%')))
            AND (:departmentId IS NULL OR d.department.id = :departmentId)
            AND (:active IS NULL OR d.active = :active)
            """)
    Page<Doctor> search(
            @Param("name") String name,
            @Param("departmentId") UUID departmentId,
            @Param("active") Boolean active,
            Pageable pageable);
}