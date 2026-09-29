package com.dau.studentapi.repository;

import com.dau.studentapi.model.Student;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Student Repository Layer
 * Implements in-memory data store for Lab 3.
 */
@Repository
public class StudentRepository {

    private final ConcurrentHashMap<String, Student> store = new ConcurrentHashMap<>();
    private final AtomicInteger idSequence = new AtomicInteger(5);

    public StudentRepository() {
        // Pre-seed with DAU students
        save(new Student("MScIT-25-001", "Panthil Shah", "panthil.shah@dau.ac.in", "M.Sc. Information Technology", 3));
        save(new Student("MScIT-25-002", "Rhea Deshmukh", "rhea.deshmukh@dau.ac.in", "M.Sc. Information Technology", 3));
        save(new Student("MScIT-25-003", "Siddharth Mehta", "siddharth.mehta@dau.ac.in", "M.Sc. Information Technology", 3));
        save(new Student("BTech-23-142", "Ananya Joshi", "ananya.joshi@dau.ac.in", "B.Tech. Information & Communication Technology", 5));
    }

    public List<Student> findAll() {
        return new ArrayList<>(store.values());
    }

    public Optional<Student> findById(String id) {
        return Optional.ofNullable(store.get(id));
    }

    public Student save(Student student) {
        if (student.getId() == null || student.getId().isBlank()) {
            student.setId("MScIT-25-00" + idSequence.getAndIncrement());
        }
        store.put(student.getId(), student);
        return student;
    }

    public Optional<Student> deleteById(String id) {
        return Optional.ofNullable(store.remove(id));
    }

    public boolean existsById(String id) {
        return store.containsKey(id);
    }
}
