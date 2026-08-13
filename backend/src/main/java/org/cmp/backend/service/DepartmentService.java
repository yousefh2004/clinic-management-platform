package org.cmp.backend.service;

import lombok.RequiredArgsConstructor;
import org.cmp.backend.dto.DepartmentRequest;
import org.cmp.backend.dto.DepartmentResponse;
import org.cmp.backend.dto.PageResponse;
import org.cmp.backend.entity.Department;
import org.cmp.backend.exception.ConflictException;
import org.cmp.backend.exception.ResourceNotFoundException;
import org.cmp.backend.repository.DepartmentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public PageResponse<DepartmentResponse> list(String name, Pageable pageable) {
        Page<Department> page = (name == null || name.isBlank())
                ? departmentRepository.findAll(pageable)
                : departmentRepository.findByNameContainingIgnoreCase(name, pageable);

        return new PageResponse<>(
                page.getContent().stream().map(this::toResponse).toList(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.getNumber(),
                page.getSize()
        );
    }

    public DepartmentResponse getById(UUID id) {
        return toResponse(findEntity(id));
    }

    public DepartmentResponse create(DepartmentRequest request) {
        if (departmentRepository.existsByCode(request.code())) {
            throw new ConflictException("Department code is already taken.");
        }

        Department department = new Department();
        department.setName(request.name());
        department.setCode(request.code());

        return toResponse(departmentRepository.save(department));
    }

    public DepartmentResponse update(UUID id, DepartmentRequest request) {
        Department department = findEntity(id);

        if (departmentRepository.existsByCodeAndIdNot(request.code(), id)) {
            throw new ConflictException("Department code is already taken.");
        }

        department.setName(request.name());
        department.setCode(request.code());

        return toResponse(departmentRepository.save(department));
    }

    public void delete(UUID id) {
        Department department = findEntity(id);
        // check if department has doctors assigned (to do)
        departmentRepository.delete(department);
    }

    private Department findEntity(UUID id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + id));
    }

    private DepartmentResponse toResponse(Department d) {
        return new DepartmentResponse(
                d.getId(), d.getName(), d.getCode(),
                d.getCreatedAt(), d.getCreatedBy(),
                d.getUpdatedAt(), d.getUpdatedBy()
        );
    }
}