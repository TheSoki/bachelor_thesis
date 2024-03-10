/**
 * @file run.c
 * @brief Handles the main application logic.
 */

#include "esp_log.h"
#include <sys/time.h>
#include "esp_sleep.h"
#include "wifi.h"
#include "http_client.h"
#include <stdbool.h>

static const char *DISPLAY_TAG = "run.c";
static const long long INTERVAL = 1000 * 60 * 60 * 24; // 24 hours


/**
 * @brief Get the current timestamp in milliseconds.
 * @return The current timestamp in milliseconds.
 */
long long current_timestamp(void)
{
    struct timeval te; 
    // get current time
    gettimeofday(&te, NULL); 
    // calculate milliseconds
    long long milliseconds = te.tv_sec * 1000LL + te.tv_usec / 1000; 
    return milliseconds;
}

/**
 * @brief Run the main application.
 */
void run(void)
{
    ESP_LOGI(DISPLAY_TAG, "run");

    long long start = current_timestamp();

    bool isConnected = connect_to_wifi();
    if (isConnected == true)
    {
        http_get_task();
        disconnect_from_wifi();
    }

    long long end = current_timestamp();
    ESP_LOGI(DISPLAY_TAG, "run took %lld milliseconds", end - start);
    long long sleep = INTERVAL - (end - start);

    ESP_LOGI(DISPLAY_TAG, "sleeping for %lld milliseconds\n", sleep);

    // sleep in microseconds
    long long sleep_in_us = sleep * 1000;
    esp_deep_sleep(sleep_in_us);
}