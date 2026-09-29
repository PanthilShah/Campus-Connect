package com.dau.studentclient.model

import com.google.gson.annotations.SerializedName

/**
 * Student Domain Model for Android REST Client
 * Lab 4 - Dhirubhai Ambani University
 */
data class Student(
    @SerializedName("id")
    val id: String? = null,

    @SerializedName("name")
    val name: String,

    @SerializedName("email")
    val email: String,

    @SerializedName("course")
    val course: String,

    @SerializedName("semester")
    val semester: Int,

    @SerializedName("createdAt")
    val createdAt: String? = null
)

/**
 * Generic API Response wrapper from REST service
 */
data class ApiResponse<T>(
    @SerializedName("success")
    val success: Boolean,

    @SerializedName("message")
    val message: String? = null,

    @SerializedName("count")
    val count: Int? = null,

    @SerializedName("data")
    val data: T? = null,

    @SerializedName("error")
    val error: String? = null,

    @SerializedName("details")
    val details: List<String>? = null
)
