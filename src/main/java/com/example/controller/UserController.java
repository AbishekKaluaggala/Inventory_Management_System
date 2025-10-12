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
    @ResponseBody  // Return JSON instead of HTML page
    public List<User> listUsers() {
        return userService.getAllUsers();
    }

    // Show add user form
    @GetMapping("/add")
    public String showAddUserForm(Model model) {
        model.addAttribute("user", new User());
        model.addAttribute("roles", Role.values());
        return "user-add";
    }

    // Save new user - FIXED FOR POSTMAN
    @PostMapping("/add")
    @ResponseBody  // Return JSON response
    public User addUser(@RequestBody User user) {
        return userService.saveUser(user);
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
            model.addAttribute("user", user);
            return "redirect:/dashboard";
        } else {
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
    @ResponseBody
    public User updateUserRole(@RequestParam String userId,
                               @RequestParam Role role) {
        return userService.updateUserRole(userId, role);
    }

    // Toggle user active status (Admin only)
    @GetMapping("/toggle-status/{id}")
    @ResponseBody
    public User toggleUserStatus(@PathVariable String id) {
        return userService.toggleUserStatus(id);
    }

    // Delete user (Admin only)
    @GetMapping("/delete/{id}")
    @ResponseBody
    public String deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return "User deleted successfully";
    }

    // Get users by role (Admin viewing specific role)
    @GetMapping("/role/{role}")
    @ResponseBody
    public List<User> getUsersByRole(@PathVariable Role role) {
        return userService.getUsersByRole(role);
    }
}