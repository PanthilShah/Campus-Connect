package com.dau.studentclient.ui

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import com.dau.studentclient.R
import com.dau.studentclient.network.ApiClient
import com.google.android.material.floatingactionbutton.FloatingActionButton
import kotlinx.coroutines.DispatchException
import kotlinx.coroutines.launch

/**
 * MainActivity - Displays list of students fetched from REST API (GET /students)
 * Lab 4 - Android Mobile Client Integration
 */
class MainActivity : AppCompatActivity() {

    private lateinit var swipeRefresh: SwipeRefreshLayout
    private lateinit var recyclerView: RecyclerView
    private lateinit var progressBar: ProgressBar
    private lateinit var tvEmpty: TextView
    private lateinit var fabAddStudent: FloatingActionButton
    private lateinit var adapter: StudentAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        swipeRefresh = findViewById(R.id.swipeRefresh)
        recyclerView = findViewById(R.id.recyclerViewStudents)
        progressBar = findViewById(R.id.progressBar)
        tvEmpty = findViewById(R.id.tvEmptyState)
        fabAddStudent = findViewById(R.id.fabAddStudent)

        setupRecyclerView()

        swipeRefresh.setOnRefreshListener {
            fetchStudents(isSwipe = true)
        }

        fabAddStudent.setOnClickListener {
            val intent = Intent(this, AddStudentActivity::class.java)
            startActivity(intent)
        }

        fetchStudents()
    }

    override fun onResume() {
        super.onResume()
        fetchStudents(isSwipe = true)
    }

    private fun setupRecyclerView() {
        adapter = StudentAdapter(emptyList()) { student ->
            Toast.makeText(this, "${student.name} (${student.id})", Toast.LENGTH_SHORT).show()
        }
        recyclerView.layoutManager = LinearLayoutManager(this)
        recyclerView.adapter = adapter
    }

    private fun fetchStudents(isSwipe: Boolean = false) {
        if (!isSwipe) {
            progressBar.visibility = View.VISIBLE
            tvEmpty.visibility = View.GONE
        }

        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.getAllStudents()

                progressBar.visibility = View.GONE
                swipeRefresh.isRefreshing = false

                if (response.isSuccessful && response.body() != null) {
                    val studentList = response.body()?.data ?: emptyList()
                    if (studentList.isEmpty()) {
                        tvEmpty.visibility = View.VISIBLE
                        tvEmpty.text = "No students registered in registry."
                    } else {
                        tvEmpty.visibility = View.GONE
                    }
                    adapter.updateData(studentList)
                } else {
                    // HTTP Error Handling (Section 8 of Lab 4)
                    when (response.code()) {
                        404 -> Toast.makeText(this@MainActivity, "Resource not found (404)", Toast.LENGTH_LONG).show()
                        500 -> Toast.makeText(this@MainActivity, "Server internal error (500)", Toast.LENGTH_LONG).show()
                        else -> Toast.makeText(this@MainActivity, "HTTP Error: ${response.code()}", Toast.LENGTH_LONG).show()
                    }
                }
            } catch (e: Exception) {
                progressBar.visibility = View.GONE
                swipeRefresh.isRefreshing = false
                tvEmpty.visibility = View.VISIBLE
                tvEmpty.text = "Unable to connect to REST API.\nEnsure backend is running at ${ApiClient.API_BASE_URL}"
                Toast.makeText(this@MainActivity, "Network Error: Something went wrong", Toast.LENGTH_LONG).show()
            }
        }
    }
}
