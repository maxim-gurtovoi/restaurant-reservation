-- CreateIndex
CREATE INDEX "Reservation_tableId_status_startAt_endAt_idx" ON "Reservation"("tableId", "status", "startAt", "endAt");

-- CreateIndex
CREATE INDEX "Reservation_restaurantId_tableId_status_startAt_endAt_idx" ON "Reservation"("restaurantId", "tableId", "status", "startAt", "endAt");

