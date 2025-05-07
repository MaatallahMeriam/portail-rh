package com.example.PORTAIL_RH.user_service.user_service.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BirthdayWishDTO {

    private String message;
    private String senderPhotoUrl;
    private String senderNom;
    private String senderPrenom;
}