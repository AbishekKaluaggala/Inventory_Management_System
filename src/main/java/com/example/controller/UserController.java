package com.example.controller;

import com.example.entity.Role;
import com.example.entity.User;
import com.example.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    // Display all users (Admin only)
    @GetMapping("/list")
    public String listUsers(Model model) {
        List<User> users = userService.getAllUsers();
        model.addAttribute("users", users);
        return "user-list";
    }

    // Show add user form
    @GetMapping("/add")
    public String showAddUserForm(Model model) {
        model.addAttribute("user", new User());
        model.addAttribute("roles", Role.values()); // Pass all roles to form
        return "user-add";
    }

    // Save new user
    @PostMapping("/add")
    public String addUser(@ModelAttribute User user) {
        userService.saveUser(user);
        return "redirect:/users/list";
    }

    // Show login form
    @GetMapping("/login")
    public String showLoginForm() {
        return "login";
    }

    // Process login
    @PostMapping("/login")
    public String login(@RequestParam String username,
                        @RequestParam String password,
                        Model model) {
        User user = userService.login(username, password);
        if (user != null) {
            // Login successful
            model.addAttribute("user", user);
            return "redirect:/dashboard";
        } else {
            // Login failed
            model.addAttribute("error", "Invalid username, password, or account is disabled");
            return "login";
        }
    }

    // Show edit user form (Admin only)
    @GetMapping("/edit/{id}")
    public String showEditUserForm(@PathVariable String id, Model model) {
        Optional<User> user = userService.getUserById(id);
        if (user.isPresent()) {
            model.addAttribute("user", user.get());
            model.addAttribute("roles", Role.values());
            return "user-edit";
        }
        return "redirect:/users/list";
    }

    // Update user role (Admin only)
    @PostMapping("/update-role")
    public String updateUserRole(@RequestParam String userId,
                                 @RequestParam Role role) {
        userService.updateUserRole(userId, role);
        return "redirect:/users/list";
    }

    // Toggle user active status (Admin only)
    @GetMapping("/toggle-status/{id}")
    public String toggleUserStatus(@PathVariable String id) {
        userService.toggleUserStatus(id);
        return "redirect:/users/list";
    }

    // Delete user (Admin only)
    @GetMapping("/delete/{id}")
    public String deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return "redirect:/users/list";
    }

    // Get users by role (Admin viewing specific role)
    @GetMapping("/role/{role}")
    public String getUsersByRole(@PathVariable Role role, Model model) {
        List<User> users = userService.getUsersByRole(role);
        model.addAttribute("users", users);
        model.addAttribute("selectedRole", role);
        return "user-list";
    }
}