package com.dau.studentclient.ui

import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.dau.studentclient.R
import com.dau.studentclient.model.Student
import com.dau.studentclient.network.ApiClient
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout
import kotlinx.coroutines.launch
import org.json.JSONObject

/**
 * AddStudentActivity - Form to submit new student via REST API (POST /students)
 * Lab 4 - Android Mobile Client Integration
 */
class AddStudentActivity : AppCompatActivity() {

    private lateinit var tilName: TextInputLayout
    private lateinit var etName: TextInputEditText
    private lateinit var tilEmail: TextInputLayout
    private lateinit var etEmail: TextInputEditText
    private lateinit var spCourse: Spinner
    private lateinit var spSemester: Spinner
    private lateinit var btnSubmit: Button
    private lateinit var progressBar: ProgressBar

    private val courses = arrayOf(
        "M.Sc. Information Technology",
        "M.Sc. Data Science",
        "M.Tech. Software Engineering",
        "B.Tech. Information & Communication Technology",
        "B.Tech. Mathematics & Computing"
    )

    private val semesters = arrayOf("1", "2", "3", "4", "5", "6", "7", "8")

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_add_student)

        supportActionBar?.title = "Register New Student"
        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        tilName = findViewById(R.id.tilName)
        etName = findViewById(R.id.etName)
        tilEmail = findViewById(R.id.tilEmail)
        etEmail = findViewById(R.id.etEmail)
        spCourse = findViewById(R.id.spCourse)
        spSemester = findViewById(R.id.spSemester)
        btnSubmit = findViewById(R.id.btnSubmitStudent)
        progressBar = findViewById(R.id.progressBarSubmit)

        setupSpinners()

        btnSubmit.setOnClickListener {
            submitStudent()
        }
    }

    private fun setupSpinners() {
        val courseAdapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, courses)
        spCourse.adapter = courseAdapter

        val semAdapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, semesters)
        spSemester.adapter = semAdapter
        spSemester.setSelection(2) // Default to Semester 3
    }

    private fun validateInputs(): Boolean {
        var isValid = true

        val name = etName.text.toString().trim()
        val email = etEmail.text.toString().trim()

        if (name.isEmpty()) {
            tilName.error = "Name cannot be empty"
            isValid = false
        } else if (name.length < 2) {
            tilName.error = "Name must be at least 2 characters"
            isValid = false
        } else {
            tilName.error = null
        }

        val emailPattern = "[a-zA-Z0-9._-]+@[a-z]+\\.+[a-z]+"
        if (email.isEmpty()) {
            tilEmail.error = "Email is required"
            isValid = false
        } else if (!email.matches(emailPattern.toRegex())) {
            tilEmail.error = "Enter a valid email address (e.g. name@dau.ac.in)"
            isValid = false
        } else {
            tilEmail.error = null
        }

        return isValid
    }

    private fun submitStudent() {
        if (!validateInputs()) return

        val name = etName.text.toString().trim()
        val email = etEmail.text.toString().trim()
        val course = spCourse.selectedItem.toString()
        val semester = spSemester.selectedItem.toString().toInt()

        val studentPayload = Student(
            name = name,
            email = email,
            course = course,
            semester = semester
        )

        progressBar.visibility = View.VISIBLE
        btnSubmit.isEnabled = false

        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.createStudent(studentPayload)

                progressBar.visibility = View.GONE
                btnSubmit.isEnabled = true

                if (response.isSuccessful && response.code() == 201) {
                    Toast.makeText(
                        this@AddStudentActivity,
                        "Student Created Successfully (HTTP 201)",
                        Toast.LENGTH_LONG
                    ).show()
                    finish()
                } else if (response.code() == 400) {
                    // Extract structured 400 error from API (Section 8 requirement)
                    val errorBody = response.errorBody()?.string()
                    var errorMsg = "Validation failed (HTTP 400)"
                    try {
                        val json = JSONObject(errorBody ?: "{}")
                        if (json.has("message")) errorMsg = json.getString("message")
                        if (json.has("details")) {
                            val arr = json.getJSONArray("details")
                            val list = mutableListOf<String>()
                            for (i in 0 until arr.length()) list.add(arr.getString(i))
                            errorMsg = list.joinToString("\n")
                        }
                    } catch (e: Exception) {
                        // ignore JSON parse
                    }
                    Toast.makeText(this@AddStudentActivity, "Error 400:\n$errorMsg", Toast.LENGTH_LONG).show()
                } else {
                    Toast.makeText(
                        this@AddStudentActivity,
                        "HTTP Error ${response.code()}: ${response.message()}",
                        Toast.LENGTH_LONG
                    ).show()
                }
            } catch (e: Exception) {
                progressBar.visibility = View.GONE
                btnSubmit.isEnabled = true
                Toast.makeText(
                    this@AddStudentActivity,
                    "Network error: ${e.message}",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        finish()
        return true
    }
}
