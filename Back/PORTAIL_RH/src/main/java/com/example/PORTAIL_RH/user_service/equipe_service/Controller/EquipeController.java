package com.example.PORTAIL_RH.user_service.equipe_service.Controller;

import com.example.PORTAIL_RH.user_service.equipe_service.DTO.EquipeDTO;
import com.example.PORTAIL_RH.user_service.user_service.DTO.UsersDTO;
import com.example.PORTAIL_RH.user_service.equipe_service.Service.EquipeService;
import com.example.PORTAIL_RH.user_service.equipe_service.DTO.TeamMemberDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipes")
public class EquipeController {

    @Autowired
    private EquipeService equipeService;

    @PostMapping
    public ResponseEntity<EquipeDTO> createEquipe(@RequestBody EquipeDTO equipeDTO) {
        EquipeDTO createdEquipe = equipeService.createEquipe(equipeDTO);
        return new ResponseEntity<>(createdEquipe, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<EquipeDTO>> getAllEquipes() {
        List<EquipeDTO> equipes = equipeService.getAllEquipes();
        return new ResponseEntity<>(equipes, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EquipeDTO> getEquipeById(@PathVariable Long id) {
        EquipeDTO equipe = equipeService.getEquipeById(id);
        return new ResponseEntity<>(equipe, HttpStatus.OK);
    }

    @GetMapping("/manager/{managerId}")
    public ResponseEntity<List<EquipeDTO>> getEquipesByManagerId(@PathVariable Long managerId) {
        List<EquipeDTO> equipes = equipeService.getEquipesByManagerId(managerId);
        return new ResponseEntity<>(equipes, HttpStatus.OK);
    }

    @GetMapping("/{equipeId}/users")
    public ResponseEntity<List<UsersDTO>> getUsersByEquipeId(@PathVariable Long equipeId) {
        List<UsersDTO> users = equipeService.getUsersByEquipeId(equipeId);
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @GetMapping("/{equipeId}/users/exclude-manager")
    public ResponseEntity<List<UsersDTO>> getUsersByEquipeIdExcludingManager(@PathVariable Long equipeId) {
        List<UsersDTO> users = equipeService.getUsersByEquipeIdExcludingManager(equipeId);
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @GetMapping("/{equipeId}/manager")
    public ResponseEntity<UsersDTO> getManagerByEquipeId(@PathVariable Long equipeId) {
        UsersDTO manager = equipeService.getManagerByEquipeId(equipeId);
        return new ResponseEntity<>(manager, HttpStatus.OK);
    }

    @GetMapping("/manager/{managerId}/members")
    public ResponseEntity<List<TeamMemberDTO>> getTeamMembersByManagerId(@PathVariable Long managerId) {
        List<TeamMemberDTO> members = equipeService.getTeamMembersByManagerId(managerId);
        return new ResponseEntity<>(members, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEquipe(@PathVariable Long id) {
        equipeService.deleteEquipe(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EquipeDTO> updateEquipe(@PathVariable Long id, @RequestBody EquipeDTO equipeDTO) {
        EquipeDTO updatedEquipe = equipeService.updateEquipe(id, equipeDTO);
        return new ResponseEntity<>(updatedEquipe, HttpStatus.OK);
    }

    @PostMapping("/{equipeId}/users/{userId}")
    public ResponseEntity<Void> assignUserToEquipe(@PathVariable Long equipeId, @PathVariable Long userId) {
        equipeService.assignUserToEquipe(equipeId, userId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/{equipeId}/users")
    public ResponseEntity<Void> assignUsersToEquipe(@PathVariable Long equipeId, @RequestBody List<Long> userIds) {
        equipeService.assignUsersToEquipe(equipeId, userIds);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping("/{equipeId}/users/{userId}")
    public ResponseEntity<Void> removeUserFromEquipe(@PathVariable Long equipeId, @PathVariable Long userId) {
        equipeService.removeUserFromEquipe(equipeId, userId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/{equipeId}/manager/{newManagerId}")
    public ResponseEntity<EquipeDTO> updateManager(@PathVariable Long equipeId, @PathVariable Long newManagerId) {
        EquipeDTO updatedEquipe = equipeService.updateManager(equipeId, newManagerId);
        return new ResponseEntity<>(updatedEquipe, HttpStatus.OK);
    }
}