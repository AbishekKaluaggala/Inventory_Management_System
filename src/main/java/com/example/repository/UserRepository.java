package com.example.repository;

import com.example.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;
import com.example.entity.Role;


@Repository
public interface UserRepository extends JpaRepository<User,String> {
    Optional<User>findByUsername(String username);

    List<User> findByRole(Role role);

    List<User> findByIsActive(boolean b);
}
