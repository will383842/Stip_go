<?php

namespace Tests\Feature;

use App\Models\Conversation;
use App\Models\DirectMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class GroomingTest extends TestCase
{
    use RefreshDatabase;

    public function test_grooming_detection_creates_alert_for_adult_messaging_minor(): void
    {
        // Adult 25+ (born 2000 → 26 years old in 2026)
        $adult = User::factory()->create(['birth_year' => 2000]);
        // Minor 15 years old (born 2011)
        $minor = User::factory()->create(['birth_year' => 2011]);

        // Create conversation
        $conversation = Conversation::create([
            'user_a_id' => $adult->id,
            'user_b_id' => $minor->id,
            'type' => 'dm',
        ]);

        // Adult sends 6 unanswered DMs to minor
        for ($i = 0; $i < 6; $i++) {
            DirectMessage::create([
                'conversation_id' => $conversation->id,
                'sender_user_id' => $adult->id,
                'content' => "Message {$i}",
                'created_at' => now()->subHours($i),
            ]);
        }

        // Run grooming detection
        $this->artisan('dm:detect-grooming')->assertSuccessful();

        // Verify alert created
        $alert = DB::table('notifications')
            ->where('type', 'grooming_alert')
            ->where('user_id', $adult->id)
            ->first();

        $this->assertNotNull($alert, 'Grooming alert should have been created');
        $this->assertStringContainsString('grooming', $alert->type);

        $data = json_decode($alert->data, true);
        $this->assertEquals($adult->id, $data['sender_user_id']);
        $this->assertEquals($minor->id, $data['receiver_user_id']);
        $this->assertGreaterThanOrEqual(5, $data['unanswered_count']);
    }

    public function test_no_alert_when_minor_responds(): void
    {
        $adult = User::factory()->create(['birth_year' => 2000]);
        $minor = User::factory()->create(['birth_year' => 2011]);

        $conversation = Conversation::create([
            'user_a_id' => $adult->id,
            'user_b_id' => $minor->id,
            'type' => 'dm',
        ]);

        // Adult sends 6 DMs
        for ($i = 0; $i < 6; $i++) {
            DirectMessage::create([
                'conversation_id' => $conversation->id,
                'sender_user_id' => $adult->id,
                'content' => "Message {$i}",
                'created_at' => now()->subHours(10 - $i),
            ]);
        }

        // Minor replies to the last one
        DirectMessage::create([
            'conversation_id' => $conversation->id,
            'sender_user_id' => $minor->id,
            'content' => 'OK',
            'created_at' => now(),
        ]);

        $this->artisan('dm:detect-grooming')->assertSuccessful();

        // No alert — minor responded
        $alert = DB::table('notifications')
            ->where('type', 'grooming_alert')
            ->where('user_id', $adult->id)
            ->first();

        $this->assertNull($alert, 'No grooming alert when minor responds');
    }

    public function test_no_alert_for_adult_to_adult(): void
    {
        $adult1 = User::factory()->create(['birth_year' => 2000]);
        $adult2 = User::factory()->create(['birth_year' => 1998]);

        $conversation = Conversation::create([
            'user_a_id' => $adult1->id,
            'user_b_id' => $adult2->id,
            'type' => 'dm',
        ]);

        for ($i = 0; $i < 6; $i++) {
            DirectMessage::create([
                'conversation_id' => $conversation->id,
                'sender_user_id' => $adult1->id,
                'content' => "Message {$i}",
                'created_at' => now()->subHours($i),
            ]);
        }

        $this->artisan('dm:detect-grooming')->assertSuccessful();

        $alert = DB::table('notifications')
            ->where('type', 'grooming_alert')
            ->first();

        $this->assertNull($alert, 'No alert for adult-to-adult DMs');
    }

    public function test_minor_cannot_dm_non_friend(): void
    {
        $minor = User::factory()->create(['birth_year' => 2011]);
        $stranger = User::factory()->create(['birth_year' => 2000]);

        $response = $this->actingAs($minor)
            ->postJson('/api/v1/dm', [
                'receiver_user_id' => $stranger->id,
                'content' => 'Hello',
            ]);

        $response->assertForbidden()
            ->assertJsonPath('errors.0.code', 'minor_friends_only');
    }
}
