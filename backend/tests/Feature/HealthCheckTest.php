<?php

test('health check returns ok', function () {
    $response = $this->getJson('/api/v1/health');

    $response->assertOk()
        ->assertJsonPath('data.status', 'ok')
        ->assertJsonPath('data.app', 'Stip Me')
        ->assertJsonStructure([
            'data' => ['status', 'app', 'version', 'timestamp'],
        ]);
});
