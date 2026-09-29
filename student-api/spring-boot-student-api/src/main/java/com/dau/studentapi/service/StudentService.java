package com.dau.studentapi.service;

import com.dau.studentapi.model.Student;
import com.dau.studentapi.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Student Service Layer
 * Business logic separating controller from repository.
 */
@Service
public class StudentService {

    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Optional<Student> getStudentById(String id) {
        return studentRepository.findById(id);
    }

    public Student createStudent(Student student) {
        return studentRepository.save(student);
    }

    public Optional<Student> updateStudent(String id, Student studentDetails) {
        Optional<Student> existingOpt = studentRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return Optional.empty();
        }

        Student student = existingOpt.get();
        student.setName(studentDetails.getName());
        student.setEmail(studentDetails.getEmail());
        student.setCourse(studentDetails.getCourse());
        student.setSemester(studentDetails.getSemester());

        return Optional.of(studentRepository.save(student));
    }

    public Optional<Student> deleteStudent(String id) {
        return studentRepository.deleteById(id);
    }
}
