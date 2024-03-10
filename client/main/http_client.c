/**
 * @file http_client.c
 * @brief Handles the http client logic.
 */

#include "http_client.h"
#include "esp_http_client.h"
#include "esp_log.h"
#include "environment.h"

static const char *DISPLAY_TAG = "http_client.c";


/**
 * @brief Perform an HTTP GET request to download an image and render it.
 */
esp_err_t http_get_task(void)
{
    esp_http_client_config_t config = {
        .url = ESP_SERVER_URL,
    };
    esp_http_client_handle_t client = esp_http_client_init(&config);
    if (client == NULL) {
        ESP_LOGE(DISPLAY_TAG, "Failed to initialize HTTP client");
        return ESP_FAIL;
    }

    esp_http_client_set_header(client, "X-Device-ID", ESP_DEVICE_ID);
    esp_http_client_set_header(client, "X-Device-Secret", ESP_DEVICE_SECRET);

    esp_err_t err = esp_http_client_perform(client);
    if (err == ESP_OK) {
        ESP_LOGI(DISPLAY_TAG, "HTTP GET Status = %d, content_length = %lld", esp_http_client_get_status_code(client), esp_http_client_get_content_length(client));
        //! if was successful, render image

    } else {
        ESP_LOGE(DISPLAY_TAG, "HTTP GET request failed: %s", esp_err_to_name(err));
        //! if not, render error

    }

    esp_http_client_cleanup(client);
    return err;
}