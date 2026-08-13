package org.cmp.backend.repository;

import org.cmp.backend.entity.Department;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DepartmentRepository extends JpaRepository<Department, UUID> {
    boolean existsByCode(String code);
    boolean existsByCodeAndIdNot(String code, UUID id);
    Page<Department> findByNameContainingIgnoreCase(String name, Pageable pageable);
}