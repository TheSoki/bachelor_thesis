/**
 * @file http_client.c
 * @brief Handles the http client logic.
 */

#include "http_client.h"
#include "esp_http_client.h"
#include "esp_log.h"
#include "environment.h"
#include "epd.h"

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

        // Allocate data
        size_t png_size = esp_http_client_get_content_length(client);
        char *data = malloc(png_size);
        if (data == NULL)
        {
            ESP_LOGE(DISPLAY_TAG, "Could not allocate %d bytes to load PNG", png_size);
            ESP_ERROR_CHECK(esp_http_client_close(client));
            ESP_ERROR_CHECK(esp_http_client_cleanup(client));
            free(data);

            return ESP_ERR_NO_MEM;
        }

        // Read png
        int read_len = esp_http_client_read(client, data, png_size);
        if (read_len != png_size)
        {
            ESP_LOGE(DISPLAY_TAG, "Expected to read %d bytes, but got %d", png_size, read_len);
            ESP_ERROR_CHECK(esp_http_client_close(client));
            ESP_ERROR_CHECK(esp_http_client_cleanup(client));
            free(data);

            return ESP_FAIL;
        }

        ESP_ERROR_CHECK(esp_http_client_close(client));
        ESP_ERROR_CHECK(esp_http_client_cleanup(client));

        ESP_LOGI(DISPLAY_TAG, "Passing the new image to EPD");

        EPD_before_load();
        err = EPD_load_image(data, png_size);
        free(data);
        if (err != ESP_OK)
        {
            ESP_LOGE(DISPLAY_TAG, "Image display failed");
            EPD_shutdown();

            return err;
        }

        EPD_display();
        EPD_shutdown();

        return ESP_OK;
    } else {
        ESP_LOGE(DISPLAY_TAG, "HTTP GET request failed: %s", esp_err_to_name(err));
        //! if not, render error

    }

    esp_http_client_cleanup(client);
    
    return err;
}