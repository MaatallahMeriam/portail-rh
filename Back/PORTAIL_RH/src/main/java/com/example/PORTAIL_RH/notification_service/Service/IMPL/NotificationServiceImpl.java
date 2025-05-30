package com.example.PORTAIL_RH.notification_service.Service.IMPL;

import com.example.PORTAIL_RH.notification_service.DTO.NotificationDTO;
import com.example.PORTAIL_RH.notification_service.Entity.Notification;
import com.example.PORTAIL_RH.notification_service.Repo.NotificationRepository;
import com.example.PORTAIL_RH.notification_service.Service.NotificationService;
import com.example.PORTAIL_RH.request_service.Entity.Demande;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import com.example.PORTAIL_RH.user_service.user_service.Repo.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private NotificationDTO mapToDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setUserId(notification.getUser().getId());
        dto.setMessage(notification.getMessage());
        dto.setType(notification.getType());
        dto.setDemandeId(notification.getDemandeId());
        dto.setRead(notification.isRead());
        dto.setCreatedAt(notification.getCreatedAt());
        Users triggeredByUser = notification.getTriggeredByUser();
        if (triggeredByUser != null) {
            dto.setUserName(triggeredByUser.getPrenom() + " " + triggeredByUser.getNom());
            String imageUrl = triggeredByUser.getImage() != null
                    ? ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/" + triggeredByUser.getImage().replace("\\", "/"))
                    .toUriString()
                    : null;
            dto.setUserImage(imageUrl);
            System.out.println("Mapping Notification to DTO: type=" + notification.getType() +
                    ", userName=" + dto.getUserName() +
                    ", userImage=" + dto.getUserImage());
        } else {
            System.out.println("No triggeredByUser for notification type=" + notification.getType());
        }
        return dto;
    }

    @Transactional
    public void createNotificationForUser(Users user, String message, String type, Long demandeId, Users triggeredByUser) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setType(type);
        notification.setDemandeId(demandeId);
        notification.setRead(false);
        notification.setTriggeredByUser(triggeredByUser);
        notificationRepository.save(notification);

        NotificationDTO notificationDTO = mapToDTO(notification);
        messagingTemplate.convertAndSendToUser(
                String.valueOf(user.getId()),
                "/notifications",
                notificationDTO
        );
    }

    @Override
    @Transactional
    public void createNotificationForRole(Demande demande) {
        Users.Role targetRole = demande.getType() == Demande.DemandeType.CONGES ? Users.Role.MANAGER : Users.Role.RH;
        Users user = demande.getUser();
        String userFullName = user.getPrenom() + " " + user.getNom();

        if (demande.getType() == Demande.DemandeType.CONGES) {
            if (user.getEquipe() == null) {
                throw new RuntimeException("L'utilisateur n'appartient à aucune équipe");
            }
            Users manager = user.getEquipe().getManager();
            if (manager == null) {
                throw new RuntimeException("Aucun manager assigné à l'équipe de l'utilisateur");
            }
            String message = String.format("Membre %s a soumis une demande de congé", userFullName);
            Notification notification = new Notification();
            notification.setUser(manager);
            notification.setMessage(message);
            notification.setType(demande.getType().toString());
            notification.setDemandeId(demande.getId());
            notification.setRead(false);
            notification.setTriggeredByUser(user);
            notificationRepository.save(notification);

            NotificationDTO notificationDTO = mapToDTO(notification);
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(manager.getId()),
                    "/notifications",
                    notificationDTO
            );
        } else {
            List<Users> targetUsers = usersRepository.findByRole(targetRole);
            String message = String.format("Nouvelle demande de %s soumise par %s",
                    demande.getType().toString().toLowerCase(), userFullName);

            for (Users targetUser : targetUsers) {
                Notification notification = new Notification();
                notification.setUser(targetUser);
                notification.setMessage(message);
                notification.setType(demande.getType().toString());
                notification.setDemandeId(demande.getId());
                notification.setRead(false);
                notification.setTriggeredByUser(user);
                notificationRepository.save(notification);

                NotificationDTO notificationDTO = mapToDTO(notification);
                messagingTemplate.convertAndSendToUser(
                        String.valueOf(targetUser.getId()),
                        "/notifications",
                        notificationDTO
                );
            }
        }
    }

    @Transactional
    public void createNotificationForUser(Users user, String message, String type, Long demandeId) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setType(type);
        notification.setDemandeId(demandeId);
        notification.setRead(false);
        notificationRepository.save(notification);

        NotificationDTO notificationDTO = mapToDTO(notification);
        messagingTemplate.convertAndSendToUser(
                String.valueOf(user.getId()),
                "/notifications",
                notificationDTO
        );
    }

    @Transactional
    public void createNotificationForRoleUsers(Users.Role role, String message, String type, Long demandeId) {
        List<Users> targetUsers = usersRepository.findByRole(role);
        for (Users targetUser : targetUsers) {
            Notification notification = new Notification();
            notification.setUser(targetUser);
            notification.setMessage(message);
            notification.setType(type);
            notification.setDemandeId(demandeId);
            notification.setRead(false);
            notificationRepository.save(notification);

            NotificationDTO notificationDTO = mapToDTO(notification);
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(targetUser.getId()),
                    "/notifications",
                    notificationDTO
            );
        }
    }

    @Override
    @Transactional
    public void notifyRequesterStatusChange(Demande demande, String status, Users triggeredByUser) {
        Users user = demande.getUser();
        String type = demande.getType().toString();
        String message;

        if (triggeredByUser != null) {
            String processingUserName = triggeredByUser.getPrenom() + " " + triggeredByUser.getNom();
            message = String.format("Votre demande de %s a été %s par %s",
                    type.toLowerCase(), status.toLowerCase(), processingUserName);
        } else {
            message = String.format("Votre demande de %s a été %s",
                    type.toLowerCase(), status.toLowerCase());
        }

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setType(type);
        notification.setDemandeId(demande.getId());
        notification.setRead(false);
        notification.setTriggeredByUser(triggeredByUser);
        notificationRepository.save(notification);

        NotificationDTO notificationDTO = mapToDTO(notification);
        messagingTemplate.convertAndSendToUser(
                String.valueOf(user.getId()),
                "/notifications",
                notificationDTO
        );
    }

    @Override
    public List<NotificationDTO> getNotificationsByUserId(Long userId, boolean isRead) {
        return notificationRepository.findByUserIdAndIsRead(userId, isRead, Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<NotificationDTO> getNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserId(userId, Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public NotificationDTO markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalStateException("Notification non trouvée"));
        notification.setRead(true);
        notificationRepository.save(notification);
        return mapToDTO(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        System.out.println("Le frontend a appelé markAllAsRead pour userId=" + userId);
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsRead(userId, false);
        System.out.println("Nombre de notifications non lues trouvées pour userId=" + userId + " : " + unreadNotifications.size());
        for (Notification notification : unreadNotifications) {
            notification.setRead(true);
            notificationRepository.save(notification);
            System.out.println("Notification ID=" + notification.getId() + " marquée comme lue pour userId=" + userId);
        }
        System.out.println("markAllAsRead terminé pour userId=" + userId);
    }
}