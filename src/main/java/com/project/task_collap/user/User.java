package com.project.task_collap.user;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.annotation.Nonnull;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "users")
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue
    private Integer id;

    @Nonnull
    @NotBlank
    @Column(unique = true)
    private String username;

    @Column(unique = true)
    @Nonnull
    @NotBlank
    private String email;

    @Nonnull
    @NotBlank
    private String passwordHash;

    @CreationTimestamp
    private LocalDateTime createdAt;

}
