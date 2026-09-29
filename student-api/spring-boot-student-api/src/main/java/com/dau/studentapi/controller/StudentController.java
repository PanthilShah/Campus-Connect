package com.dau.studentapi.controller;

import com.dau.studentapi.model.Student;
import com.dau.studentapi.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Student REST Controller
 * Demonstrates Spring Boot RESTful Web Service architecture (Lab 3)
 */
@RestController
@RequestMapping("/students")
@CrossOrigin(origins = "*")
@Tag(name = "Students", description = "CRUD operations for Student records in Spring Boot")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    // 1. GET /students - List all students
    @Operation(summary = "List all students", description = "Retrieves the full list of students from repository")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved students")
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllStudents() {
        List<Student> students = studentService.getAllStudents();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("count", students.size());
        response.put("data", students);
        return ResponseEntity.ok(response);
    }

    // 2. GET /students/{id} - Get single student by ID
    @Operation(summary = "Get student by ID", description = "Returns a single student by identifier")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Student found"),
        @ApiResponse(responseCode = "404", description = "Student not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<?> getStudentById(
            @Parameter(description = "Student ID e.g. MScIT-25-001") @PathVariable String id) {
        Optional<Student> studentOpt = studentService.getStudentById(id);

        if (studentOpt.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Not Found");
            error.put("message", "Student with ID '" + id + "' was not found.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", studentOpt.get());
        return ResponseEntity.ok(response);
    }

    // 3. POST /students - Create a new student
    @Operation(summary = "Create a new student", description = "Validates and saves a new student record")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Student created successfully"),
        @ApiResponse(responseCode = "400", description = "Validation failed for request body")
    })
    @PostMapping
    public ResponseEntity<?> createStudent(@Valid @RequestBody Student student) {
        Student created = studentService.createStudent(student);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Student record created successfully.");
        response.put("data", created);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 4. PUT /students/{id} - Update an existing student
    @Operation(summary = "Update student details", description = "Updates fields of an existing student")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Student updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid payload"),
        @ApiResponse(responseCode = "404", description = "Student not found")
    })
    @PutMapping("/{id}")
    public ResponseEntity<?> updateStudent(
            @PathVariable String id,
            @Valid @RequestBody Student studentDetails) {
        Optional<Student> updatedOpt = studentService.updateStudent(id, studentDetails);

        if (updatedOpt.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Not Found");
            error.put("message", "Cannot update. Student with ID '" + id + "' does not exist.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Student '" + id + "' updated successfully.");
        response.put("data", updatedOpt.get());
        return ResponseEntity.ok(response);
    }

    // 5. DELETE /students/{id} - Delete a student
    @Operation(summary = "Delete student by ID", description = "Removes a student record from the repository")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Student deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Student not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable String id) {
        Optional<Student> deletedOpt = studentService.deleteStudent(id);

        if (deletedOpt.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Not Found");
            error.put("message", "Cannot delete. Student with ID '" + id + "' was not found.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Student record '" + id + "' successfully removed.");
        response.put("deleted", deletedOpt.get());
        return ResponseEntity.ok(response);
    }
}
