import React from 'react';
import PlayAnnouncementComponent from "./PlayAnnouncementComponent";

export const loadPlayAnnouncementInterface = (flex, manager) => {
    flex.ParticipantsCanvas.Content.add(
        <PlayAnnouncementComponent key="PlayAnnouncementComponent"/>,
        {
            sortOrder: 1
        })
}