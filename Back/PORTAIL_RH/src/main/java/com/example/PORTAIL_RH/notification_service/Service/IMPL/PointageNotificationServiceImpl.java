package com.example.PORTAIL_RH.notification_service.Service.IMPL;


import com.example.PORTAIL_RH.notification_service.DTO.PointageNotificationDTO;
import com.example.PORTAIL_RH.notification_service.Entity.PointageNotification;
import com.example.PORTAIL_RH.notification_service.Service.PointageNotificationService;
import com.example.PORTAIL_RH.teletravail_service.entity.UserTeletravail;
import com.example.PORTAIL_RH.notification_service.Repo.PointageNotificationRepository;
import com.example.PORTAIL_RH.teletravail_service.repo.TeletravailPointageRepository;
import com.example.PORTAIL_RH.teletravail_service.repo.UserTeletravailRepository;
import com.example.PORTAIL_RH.user_service.user_service.Entity.Users;
import com.example.PORTAIL_RH.user_service.user_service.Repo.UsersRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class PointageNotificationServiceImpl implements PointageNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(PointageNotificationServiceImpl.class);

    @Autowired
    private PointageNotificationRepository notificationRepository;

    @Autowired
    private UserTeletravailRepository userTeletravailRepository;

    @Autowired
    private TeletravailPointageRepository pointageRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Override
    @Transactional
    public PointageNotificationDTO checkPendingPointageNotification(Long userId, LocalDate date) {
        try {
            Users user = usersRepository.findById(userId)
                    .orElseThrow(() -> new IllegalStateException("Utilisateur non trouvé."));

            // Vérifier si l'utilisateur a un jour de TT planifié aujourd'hui
            UserTeletravail userTeletravail = userTeletravailRepository.findByUserIdAndJoursChoisisContaining(userId, date.toString())
                    .orElse(null);

            if (userTeletravail == null) {
                logger.info("Aucun jour de télétravail planifié pour userId={} à la date={}", userId, date);
                return null;
            }

            // Vérifier si un pointage existe déjà pour aujourd'hui
            if (pointageRepository.existsByUserAndPointageDate(user, date)) {
                logger.info("Pointage déjà effectué pour userId={} à la date={}", userId, date);
                return null;
            }

            // Vérifier si une notification existe déjà et n'est pas encore reconnue
            PointageNotification notification = notificationRepository.findByUserAndPointageDateAndIsAcknowledgedFalse(user, date)
                    .orElseGet(() -> {
                        // Créer une nouvelle notification si elle n'existe pas
                        PointageNotification newNotification = new PointageNotification();
                        newNotification.setUser(user);
                        newNotification.setPointageDate(date);
                        newNotification.setIsAcknowledged(false);
                        return notificationRepository.save(newNotification);
                    });

            // Mapper vers DTO
            PointageNotificationDTO dto = new PointageNotificationDTO();
            dto.setId(notification.getId());
            dto.setUserId(notification.getUser().getId());
            dto.setPointageDate(notification.getPointageDate());
            dto.setIsAcknowledged(notification.isAcknowledged());

            logger.info("Notification de pointage en attente pour userId={} à la date={}", userId, date);
            return dto;

        } catch (Exception e) {
            logger.error("Erreur lors de la vérification des notifications pour userId={} : {}", userId, e.getMessage(), e);
            throw new RuntimeException("Erreur lors de la vérification des notifications : " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void acknowledgeNotification(Long notificationId) {
        try {
            PointageNotification notification = notificationRepository.findById(notificationId)
                    .orElseThrow(() -> new IllegalStateException("Notification non trouvée."));
            notification.setIsAcknowledged(true);
            notificationRepository.save(notification);
            logger.info("Notification {} marquée comme reconnue.", notificationId);
        } catch (Exception e) {
            logger.error("Erreur lors de la reconnaissance de la notification {} : {}", notificationId, e.getMessage(), e);
            throw new RuntimeException("Erreur lors de la reconnaissance de la notification : " + e.getMessage());
        }
    }
}