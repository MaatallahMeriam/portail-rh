package com.example.PORTAIL_RH.equipe_service.service.impl;

import com.example.PORTAIL_RH.equipe_service.DTO.EquipeDTO;
import com.example.PORTAIL_RH.equipe_service.DTO.TeamMemberDTO;
import com.example.PORTAIL_RH.equipe_service.Service.IMPL.EquipeServiceImpl;
import com.example.PORTAIL_RH.user_service.user_service.DTO.UsersDTO;
import com.example.PORTAIL_RH.equipe_service.Entity.Equipe;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import com.example.PORTAIL_RH.equipe_service.Repo.EquipeRepository;
import com.example.PORTAIL_RH.user_service.user_service.Repo.UsersRepository;
import com.example.PORTAIL_RH.user_service.user_service.Service.UsersService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EquipeServiceImplTest {

    @Mock
    private EquipeRepository equipeRepository;

    @Mock
    private UsersRepository usersRepository;

    @Mock
    private UsersService usersService;

    @InjectMocks
    private EquipeServiceImpl equipeService;

    private Equipe equipe;
    private Users manager;
    private Users user;
    private EquipeDTO equipeDTO;
    private UsersDTO usersDTO;
    private TeamMemberDTO teamMemberDTO;

    @BeforeEach
    void setUp() {
        // Initialize sample data
        equipe = new Equipe();
        equipe.setId(1L);
        equipe.setNom("Team A");
        equipe.setDepartement("IT");

        manager = new Users();
        manager.setId(1L);
        manager.setNom("Doe");
        manager.setPrenom("John");
        manager.setRole(Users.Role.MANAGER);
        manager.setImage("images/manager.jpg");
        manager.setEquipe(equipe); // Ensure manager is in the team

        user = new Users();
        user.setId(2L);
        user.setNom("Smith");
        user.setPrenom("Jane");
        user.setPoste("Developer");
        user.setDepartement("IT");
        user.setImage("images/user.jpg");
        user.setMail("jane.smith@example.com");
        user.setNumero("1234567890");
        user.setEquipe(equipe); // Ensure user is in the team

        // Use mutable list for users
        equipe.setManager(manager);
        equipe.setUsers(new ArrayList<>(Arrays.asList(manager, user)));
    }

    @AfterEach
    void tearDown() {
        // No static mocks to close in this setup
    }

    @Test
    void testCreateEquipe_Success() {
        // Arrange
        equipeDTO = new EquipeDTO();
        equipeDTO.setId(1L);
        equipeDTO.setNom("Team A");
        equipeDTO.setDepartement("IT");
        equipeDTO.setManagerId(1L);

        when(equipeRepository.save(any(Equipe.class))).thenReturn(equipe);
        when(usersRepository.findById(1L)).thenReturn(Optional.ofNullable(manager));

        // Act
        EquipeDTO result = equipeService.createEquipe(equipeDTO);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getNom()).isEqualTo("Team A");
        assertThat(result.getDepartement()).isEqualTo("IT");
        assertThat(result.getManagerId()).isEqualTo(1L);
        verify(equipeRepository, times(2)).save(any(Equipe.class));
        verify(usersRepository, times(1)).findById(1L);
    }

    @Test
    void testCreateEquipe_ManagerNotFound() {
        // Arrange
        equipeDTO = new EquipeDTO();
        equipeDTO.setId(1L);
        equipeDTO.setNom("Team A");
        equipeDTO.setDepartement("IT");
        equipeDTO.setManagerId(999L);

        when(equipeRepository.save(any(Equipe.class))).thenReturn(equipe);
        when(usersRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> equipeService.createEquipe(equipeDTO))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Manager not found");
        verify(equipeRepository, times(1)).save(any(Equipe.class));
    }

    @Test
    void testGetAllEquipes() {
        // Arrange
        when(equipeRepository.findAll()).thenReturn(Arrays.asList(equipe));

        // Act
        List<EquipeDTO> result = equipeService.getAllEquipes();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getNom()).isEqualTo("Team A");
        verify(equipeRepository, times(1)).findAll();
    }

    @Test
    void testGetEquipesByManagerId() {
        // Arrange
        when(equipeRepository.findByManagerId(1L)).thenReturn(Arrays.asList(equipe));

        // Act
        List<EquipeDTO> result = equipeService.getEquipesByManagerId(1L);

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getManagerId()).isEqualTo(1L);
        verify(equipeRepository, times(1)).findByManagerId(1L);
    }

    @Test
    void testGetUsersByEquipeId() {
        // Arrange
        usersDTO = new UsersDTO();
        usersDTO.setId(2L);
        usersDTO.setNom("Smith");
        usersDTO.setPrenom("Jane");

        when(equipeRepository.findById(1L)).thenReturn(Optional.of(equipe));
        when(usersService.mapToDTO(any(Users.class))).thenReturn(usersDTO);

        // Act
        List<UsersDTO> result = equipeService.getUsersByEquipeId(1L);

        // Assert
        assertThat(result).hasSize(2);
        verify(equipeRepository, times(1)).findById(1L);
        verify(usersService, times(2)).mapToDTO(any(Users.class));
    }

    @Test
    void testGetUsersByEquipeIdExcludingManager() {
        // Arrange
        usersDTO = new UsersDTO();
        usersDTO.setId(2L);
        usersDTO.setNom("Smith");
        usersDTO.setPrenom("Jane");

        when(equipeRepository.findById(1L)).thenReturn(Optional.of(equipe));
        when(usersService.mapToDTO(user)).thenReturn(usersDTO);

        // Act
        List<UsersDTO> result = equipeService.getUsersByEquipeIdExcludingManager(1L);

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(2L);
        verify(equipeRepository, times(1)).findById(1L);
        verify(usersService, times(1)).mapToDTO(user);
    }

    @Test
    void testGetManagerByEquipeId() {
        // Arrange
        usersDTO = new UsersDTO();
        usersDTO.setId(1L);
        usersDTO.setNom("Doe");
        usersDTO.setPrenom("John");

        when(equipeRepository.findById(1L)).thenReturn(Optional.of(equipe));
        when(usersService.mapToDTO(manager)).thenReturn(usersDTO);

        // Act
        UsersDTO result = equipeService.getManagerByEquipeId(1L);

        // Assert
        assertThat(result).isNotNull();
        verify(equipeRepository, times(1)).findById(1L);
        verify(usersService, times(1)).mapToDTO(manager);
    }

    @Test
    void testGetManagerByEquipeId_NoManager() {
        // Arrange
        equipe.setManager(null);
        when(equipeRepository.findById(1L)).thenReturn(Optional.of(equipe));

        // Act & Assert
        assertThatThrownBy(() -> equipeService.getManagerByEquipeId(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("No manager assigned to this equipe");
        verify(equipeRepository, times(1)).findById(1L);
    }

    @Test
    void testDeleteEquipe() {
        // Arrange
        when(equipeRepository.findById(1L)).thenReturn(Optional.of(equipe));
        when(usersRepository.save(any(Users.class))).thenReturn(user);

        // Act
        equipeService.deleteEquipe(1L);

        // Assert
        verify(equipeRepository, times(1)).findById(1L);
        verify(usersRepository, times(2)).save(any(Users.class)); // Manager and user
        verify(equipeRepository, times(1)).save(equipe);
        verify(equipeRepository, times(1)).delete(equipe);
    }

    @Test
    void testAssignUserToEquipe_Success() {
        // Arrange
        user.setEquipe(null); // User not in any team
        when(equipeRepository.findById(1L)).thenReturn(Optional.of(equipe));
        when(usersRepository.findById(2L)).thenReturn(Optional.of(user));
        when(usersRepository.save(user)).thenReturn(user);

        // Act
        equipeService.assignUserToEquipe(1L, 2L);

        // Assert
        verify(equipeRepository, times(1)).findById(1L);
        verify(usersRepository, times(1)).findById(2L);
        verify(usersRepository, times(1)).save(user);
    }

    @Test
    void testAssignUserToEquipe_UserInAnotherTeam() {
        // Arrange
        Equipe otherEquipe = new Equipe();
        otherEquipe.setId(2L);
        user.setEquipe(otherEquipe);
        when(equipeRepository.findById(1L)).thenReturn(Optional.of(equipe));
        when(usersRepository.findById(2L)).thenReturn(Optional.of(user));

        // Act & Assert
        assertThatThrownBy(() -> equipeService.assignUserToEquipe(1L, 2L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("User is already assigned to another team");
        verify(usersRepository, times(1)).findById(2L);
    }

    @Test
    void testAssignUsersToEquipe_Success() {
        // Arrange
        user.setEquipe(null); // User not in any team
        when(equipeRepository.findById(1L)).thenReturn(Optional.of(equipe));
        when(usersRepository.findAllById(Arrays.asList(2L))).thenReturn(Arrays.asList(user));
        when(equipeRepository.save(equipe)).thenReturn(equipe);

        // Act
        equipeService.assignUsersToEquipe(1L, Arrays.asList(2L));

        // Assert
        verify(equipeRepository, times(1)).findById(1L);
        verify(usersRepository, times(1)).findAllById(Arrays.asList(2L));
        verify(equipeRepository, times(1)).save(equipe);
    }

    @Test
    void testRemoveUserFromEquipe_Success() {
        // Arrange
        when(equipeRepository.findById(1L)).thenReturn(Optional.of(equipe));
        when(usersRepository.findById(2L)).thenReturn(Optional.of(user));
        when(usersRepository.save(user)).thenReturn(user);

        // Act
        equipeService.removeUserFromEquipe(1L, 2L);

        // Assert
        verify(equipeRepository, times(1)).findById(1L);
        verify(usersRepository, times(1)).findById(2L);
        verify(usersRepository, times(1)).save(user);
    }

    @Test
    void testRemoveUserFromEquipe_Manager() {
        // Arrange
        when(equipeRepository.findById(1L)).thenReturn(Optional.of(equipe));
        when(usersRepository.findById(1L)).thenReturn(Optional.of(manager));

        // Act & Assert
        assertThatThrownBy(() -> equipeService.removeUserFromEquipe(1L, 1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Cannot remove the manager from the team via this method");
        verify(usersRepository, times(1)).findById(1L);
    }

    @Test
    void testUpdateEquipe() {
        // Arrange
        equipeDTO = new EquipeDTO();
        equipeDTO.setId(1L);
        equipeDTO.setNom("Team A");
        equipeDTO.setDepartement("IT");

        when(equipeRepository.findById(1L)).thenReturn(Optional.of(equipe));
        when(equipeRepository.save(equipe)).thenReturn(equipe);

        // Act
        EquipeDTO result = equipeService.updateEquipe(1L, equipeDTO);

        // Assert
        assertThat(result.getNom()).isEqualTo("Team A");
        verify(equipeRepository, times(1)).findById(1L);
        verify(equipeRepository, times(1)).save(equipe);
    }

    @Test
    void testUpdateManager() {
        // Arrange
        Users newManager = new Users();
        newManager.setId(3L);
        newManager.setEquipe(equipe); // Ensure new manager is in the team
        when(equipeRepository.findById(1L)).thenReturn(Optional.of(equipe));
        when(usersRepository.findById(3L)).thenReturn(Optional.of(newManager));
        when(equipeRepository.save(equipe)).thenReturn(equipe);
        when(usersRepository.save(any(Users.class))).thenReturn(manager);

        // Act
        EquipeDTO result = equipeService.updateManager(1L, 3L);

        // Assert
        assertThat(result.getManagerId()).isEqualTo(3L);
        verify(equipeRepository, times(1)).findById(1L);
        verify(usersRepository, times(1)).findById(3L);
        verify(usersRepository, times(2)).save(any(Users.class)); // Old and new manager
    }

    @Test
    void testGetEquipeById() {
        // Arrange
        when(equipeRepository.findById(1L)).thenReturn(Optional.of(equipe));

        // Act
        EquipeDTO result = equipeService.getEquipeById(1L);

        // Assert
        assertThat(result.getId()).isEqualTo(1L);
        verify(equipeRepository, times(1)).findById(1L);
    }

    @Test
    void testGetTeamMembersByManagerId() {
        // Arrange
        teamMemberDTO = new TeamMemberDTO();
        teamMemberDTO.setId(2L);
        teamMemberDTO.setNom("Smith");
        teamMemberDTO.setPrenom("Jane");
        teamMemberDTO.setPoste("Developer");
        teamMemberDTO.setDepartement("IT");
        teamMemberDTO.setImage("http://localhost:8080/images/user.jpg");
        teamMemberDTO.setMail("jane.smith@example.com");
        teamMemberDTO.setNumero("1234567890");

        try (MockedStatic<ServletUriComponentsBuilder> servletUriMock = mockStatic(ServletUriComponentsBuilder.class)) {
            ServletUriComponentsBuilder builder = mock(ServletUriComponentsBuilder.class);
            servletUriMock.when(ServletUriComponentsBuilder::fromCurrentContextPath).thenReturn(builder);
            when(builder.path(anyString())).thenReturn(builder);
            when(builder.toUriString()).thenReturn("http://localhost:8080/images/user.jpg");

            when(equipeRepository.findByManagerId(1L)).thenReturn(Arrays.asList(equipe));

            // Act
            List<TeamMemberDTO> result = equipeService.getTeamMembersByManagerId(1L);

            // Assert
            assertThat(result).hasSize(1); // Only user, excluding manager
            assertThat(result.get(0).getId()).isEqualTo(2L);
            assertThat(result.get(0).getImage()).isEqualTo("http://localhost:8080/images/user.jpg");
            verify(equipeRepository, times(1)).findByManagerId(1L);
        }
    }
}