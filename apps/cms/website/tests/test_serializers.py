from django.test import TestCase, RequestFactory
from wagtail.models import Page
from website.models_pages import ServicesIndexPage, ServicePage
from website.serializers import ServicePageSerializer


class TestServicePageSerializer(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        root = Page.get_first_root_node()
        if not ServicesIndexPage.objects.first():
            idx = ServicesIndexPage(title="Services")
            root.add_child(instance=idx)
            idx.save_revision().publish()
        self.idx = ServicesIndexPage.objects.first()

    def test_description_html_present(self):
        svc = ServicePage(title="Test", intro='<p><b>Hello</b> <script>bad()</script></p>')
        self.idx.add_child(instance=svc)
        svc.save_revision().publish()
        req = self.factory.get('/api/')
        ser = ServicePageSerializer(svc, context={'request': req})
        data = ser.data
        assert 'description_html' in data
        assert '<p>' in data['description_html']
        assert '<script>' not in data['description_html']
