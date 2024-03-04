/**
 * @file main.c
 * @brief Main application file.
 */

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"
#include "run.h"

static const char *DISPLAY_TAG = "main.c";

void app_main(void)
{
    ESP_LOGI(DISPLAY_TAG, "run");
    run();
}
