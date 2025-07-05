<?php

namespace App\Controller;

use Symfony\UX\Map\Map;
use Symfony\UX\Map\Point;
use Symfony\UX\Map\Marker;
use Symfony\UX\Map\Polyline;
use Symfony\UX\Map\InfoWindow;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\UX\Map\Bridge\Leaflet\LeafletOptions;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\UX\Map\Bridge\Leaflet\Option\TileLayer;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;

final class MapController extends AbstractController
{

    #[Route('/', name: 'app_map')]
    public function index(): Response
    {

        $map = new Map();

        $leafletOptions = (new LeafletOptions())
            ->tileLayer(new TileLayer(
                url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            ));

        $map
            ->center(new Point(48.43330, 0.06669))
            ->zoom(16)
        ;

        $map
            ->addPolyline(new Polyline(
                id: 'road-01',
                points: [
                    new Point(48.433226, 0.065392),
                    new Point(48.434387, 0.057520),
                    new Point(48.434483, 0.057217),
                ],
                infoWindow: new InfoWindow(
                    content: 'Route dangereuse sans piste cyclable. Il n\'y a que des bandes.'
                ),
            ))
            ->addPolyline(new Polyline(
                id: 'road-02',
                points: [
                    new Point(48.434553, 0.05652),
                    new Point(48.436571, 0.042663),
                ],
                infoWindow: new InfoWindow(
                    headerContent: '<h4>Route en sortie d\'Alençon</h4>',
                    content: 'Route dangereuse sans piste cyclable. Il n\'y a que des bandes.'
                ),
            ))
        ;

        $map
            ->addMarker(new Marker(
                id: 'cinema-alencon',
                position: new Point(48.43361228638055, 0.06714105606079103),
                title: 'Planetcine',
                infoWindow: new InfoWindow(
                    headerContent: '<b>Planetcine</b>',
                    content: 'Cinéma d\'alençon<br><button class="btn-remove">supprimer</button>.'
                ),
            ))
        ;

        // $map->removeMarker('cinema-alencon');

        $map
            ->addMarker(new Marker(
                id: 'biocop',
                position: new Point(48.435009, 0.055819),
                title: 'Parking Biocop',
                infoWindow: new InfoWindow(
                    headerContent: '<b>Parking</b>',
                    content: 'Parking du biocop sans statitionnement pour vélo cargo.'
                )
            ))
        ;

        $map->options($leafletOptions);

        return $this->render('map/index.html.twig', [
            'map' => $map,
        ]);
    }

    #[Route('/test', name: 'app_map_test')]
    public function test(): Response {
        return new JsonResponse(['ceci est un test']);
    }

    #[Route('/remove-marker/{id}', name: 'app_map_remove_marker', methods: ['DELETE'])]
    public function removeMarker(string $id): Response
    {
        return new JsonResponse(['message' => "Vous avez supprimé le marker avec l'ID : " . $id]);
        $map = new Map();

        $map
            ->removeMarker($id)
        ;

        return new JsonResponse([
            'message' => 'Le marker est supprimé',
            'id' => $id,
        ]);
    }

    #[Route('/remove-polyline/{id}', name: 'app_map_remove_polyline', methods: ['GET', 'DELETE'])]
    public function removePolyline(string $id): Response
    {
        $map = new Map();

        $map
            ->removePolyline($id)
        ;

        return new JsonResponse([
            'message' => 'Le polyline est supprimé',
            'id' => $id,
        ]);
    }

    #[Route('/create-marker', name: 'app_map_create_marker', methods: ['POST'])]
    public function createMarker(Request $request): Response {
        $data = json_decode($request->getContent(), true);

        $title = $data['title'];
        $position = $data['position'];
        $infos = $data['infos'];

        $points = new Point($position[0], $position[1]);
        $infoWindow = new InfoWindow($infos);

        $marker = new Marker(
            position: $points,
            title: $title,
            id: $title,
            infoWindow: $infoWindow,
        );

        return new JsonResponse(['id' => $marker->id]);
    }
}
