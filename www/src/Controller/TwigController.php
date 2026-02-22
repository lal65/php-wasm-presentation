<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Twig\Environment;

class TwigController extends AbstractController {

 #[Route('/twig/{component}', name: 'twig_render')]
 public function storybook(Request $request, Environment $twig): Response {
   $template = $twig->createTemplate('Hello {{ noun|default("Twig") }}');
   $context = ['noun' => $request->query->get('noun')];
   return new Response($template->render($context));
 }



}
