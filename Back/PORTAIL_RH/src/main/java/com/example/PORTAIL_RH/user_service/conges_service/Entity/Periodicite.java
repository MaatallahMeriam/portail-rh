package com.example.PORTAIL_RH.user_service.conges_service.Entity;

public enum Periodicite {
    MENSUELLE(1), // 1 month
    TRIMESTRIELLE(3), // 3 months
    SEMESTRIELLE(6), // 6 months
    ANNUELLE(12); // 12 months

    private final int months;

    Periodicite(int months) {
        this.months = months;
    }

    public int getMonths() {
        return months;
    }
}