package com.dau.studentclient.ui

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.dau.studentclient.R
import com.dau.studentclient.model.Student

class StudentAdapter(
    private var students: List<Student>,
    private val onItemClick: (Student) -> Unit
) : RecyclerView.Adapter<StudentAdapter.StudentViewHolder>() {

    class StudentViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val tvInitials: TextView = itemView.findViewById(R.id.tvInitials)
        val tvName: TextView = itemView.findViewById(R.id.tvStudentName)
        val tvId: TextView = itemView.findViewById(R.id.tvStudentId)
        val tvEmail: TextView = itemView.findViewById(R.id.tvStudentEmail)
        val tvCourse: TextView = itemView.findViewById(R.id.tvStudentCourse)
        val tvSemester: TextView = itemView.findViewById(R.id.tvStudentSemester)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): StudentViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_student, parent, false)
        return StudentViewHolder(view)
    }

    override fun onBindViewHolder(holder: StudentViewHolder, position: Int) {
        val student = students[position]

        holder.tvName.text = student.name
        holder.tvId.text = student.id ?: "Pending"
        holder.tvEmail.text = student.email
        holder.tvCourse.text = student.course
        holder.tvSemester.text = "Sem ${student.semester}"

        // Avatar Initials
        val initials = student.name.split(" ")
            .mapNotNull { it.firstOrNull()?.uppercase() }
            .take(2)
            .joinToString("")
        holder.tvInitials.text = if (initials.isNotEmpty()) initials else "ST"

        holder.itemView.setOnClickListener {
            onItemClick(student)
        }
    }

    override fun getItemCount(): Int = students.size

    fun updateData(newStudents: List<Student>) {
        this.students = newStudents
        notifyDataSetChanged()
    }
}
