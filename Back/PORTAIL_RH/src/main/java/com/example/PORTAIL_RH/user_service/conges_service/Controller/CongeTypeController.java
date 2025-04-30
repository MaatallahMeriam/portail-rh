package com.example.PORTAIL_RH.user_service.conges_service.Controller;

import com.example.PORTAIL_RH.user_service.conges_service.DTO.CongeTypeDTO;
import com.example.PORTAIL_RH.user_service.conges_service.Service.CongeTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conge-types")
public class CongeTypeController {

    @Autowired
    private CongeTypeService congeTypeService;

    // Create a new CongeType
    @PostMapping
    public ResponseEntity<CongeTypeDTO> createCongeType(@RequestBody CongeTypeDTO dto) {
        CongeTypeDTO created = congeTypeService.createCongeType(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    // Get all CongeTypes
    @GetMapping
    public ResponseEntity<List<CongeTypeDTO>> getAllCongeTypes() {
        List<CongeTypeDTO> congeTypes = congeTypeService.getAllCongeTypes();
        return new ResponseEntity<>(congeTypes, HttpStatus.OK);
    }

    // Get global CongeTypes
    @GetMapping("/global")
    public ResponseEntity<List<CongeTypeDTO>> getGlobalCongeTypes() {
        List<CongeTypeDTO> globalCongeTypes = congeTypeService.getGlobalCongeTypes();
        return new ResponseEntity<>(globalCongeTypes, HttpStatus.OK);
    }

    // Delete a CongeType by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCongeType(@PathVariable Long id) {
        congeTypeService.deleteCongeType(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // Update a CongeType by ID
    @PutMapping("/{id}")
    public ResponseEntity<CongeTypeDTO> updateCongeType(@PathVariable Long id, @RequestBody CongeTypeDTO dto) {
        CongeTypeDTO updated = congeTypeService.updateCongeType(id, dto);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }
}