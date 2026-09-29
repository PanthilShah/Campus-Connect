package com.dau.studentclient.network

import com.dau.studentclient.model.ApiResponse
import com.dau.studentclient.model.Student
import retrofit2.Response
import retrofit2.http.*

/**
 * Retrofit REST API Service definition
 * Lab 4 - Mobile Client Integration
 */
interface StudentApiService {

    // 1. List all students
    @GET("students")
    suspend fun getAllStudents(): Response<ApiResponse<List<Student>>>

    // 2. Get single student by ID
    @GET("students/{id}")
    suspend fun getStudentById(@Path("id") id: String): Response<ApiResponse<Student>>

    // 3. Create new student
    @POST("students")
    suspend fun createStudent(@Body student: Student): Response<ApiResponse<Student>>

    // 4. Delete student by ID
    @DELETE("students/{id}")
    suspend fun deleteStudent(@Path("id") id: String): Response<ApiResponse<Student>>
}
