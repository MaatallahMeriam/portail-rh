package com.example.PORTAIL_RH.user_service.conges_service.Controller;

import com.example.PORTAIL_RH.user_service.conges_service.DTO.CongeTypeDTO;
import com.example.PORTAIL_RH.user_service.conges_service.DTO.UserCongesDTO;
import com.example.PORTAIL_RH.user_service.conges_service.Service.UserCongesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-conges")
public class UserCongesController {

    @Autowired
    private UserCongesService userCongesService;

    @PostMapping
    public ResponseEntity<UserCongesDTO> createUserConges(@RequestBody UserCongesDTO userCongesDTO) {
        UserCongesDTO created = userCongesService.createUserConges(userCongesDTO);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserCongesDTO> getUserCongesById(@PathVariable Long id) {
        UserCongesDTO userConges = userCongesService.getUserCongesById(id);
        return new ResponseEntity<>(userConges, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserCongesDTO>> getUserCongesByUserId(@PathVariable Long userId) {
        List<UserCongesDTO> userConges = userCongesService.getUserCongesByUserId(userId);
        return new ResponseEntity<>(userConges, HttpStatus.OK);
    }
    @GetMapping("/user/{userId}/all-conge-types")
    public ResponseEntity<List<CongeTypeDTO>> getAllCongeTypesForUser(@PathVariable Long userId) {
        List<CongeTypeDTO> congeTypes = userCongesService.getAllCongeTypesForUser(userId);
        return new ResponseEntity<>(congeTypes, HttpStatus.OK);
    }
    @PutMapping("/{id}")
    public ResponseEntity<UserCongesDTO> updateUserConges(@PathVariable Long id, @RequestBody UserCongesDTO userCongesDTO) {
        UserCongesDTO updated = userCongesService.updateUserConges(id, userCongesDTO);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserConges(@PathVariable Long id) {
        userCongesService.deleteUserConges(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/request")
    public ResponseEntity<Void> requestConge(
            @RequestParam Long userId,
            @RequestParam Long congeTypeId,
            @RequestParam int daysRequested) {
        userCongesService.requestConge(userId, congeTypeId, daysRequested);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/specific")
    public ResponseEntity<UserCongesDTO> assignSpecificCongeType(
            @RequestParam Long userId,
            @RequestBody UserCongesDTO userCongesDTO) {
        UserCongesDTO created = userCongesService.assignSpecificCongeType(userId, userCongesDTO);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/specific")
    public ResponseEntity<UserCongesDTO> updateSpecificCongeType(
            @RequestParam Long userId,
            @RequestParam Long congeTypeId,
            @RequestBody UserCongesDTO userCongesDTO) {
        UserCongesDTO updated = userCongesService.updateSpecificCongeType(userId, congeTypeId, userCongesDTO);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @DeleteMapping("/specific")
    public ResponseEntity<Void> deleteSpecificCongeType(
            @RequestParam Long userId,
            @RequestParam Long congeTypeId) {
        userCongesService.deleteSpecificCongeType(userId, congeTypeId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}